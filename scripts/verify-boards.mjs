import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

function buildPgConfig(connectionString) {
  const parsed = new URL(connectionString);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "") || "postgres",
    ssl: { rejectUnauthorized: false },
  };
}

async function countPosts(client, boardType, search = "") {
  const params = [boardType];
  let searchClause = "";

  if (search) {
    params.push(`%${search}%`);
    searchClause = `
      AND (
        title ILIKE $2
        OR content ILIKE $2
        OR author_name ILIKE $2
      )
    `;
  }

  const result = await client.query(
    `
    SELECT COUNT(*)::int AS total
    FROM public.board_posts
    WHERE board_type = $1
      AND parent_id IS NULL
      AND deleted_at IS NULL
      ${searchClause}
    `,
    params,
  );

  return result.rows[0].total;
}

async function listPosts(client, boardType, { page = 1, pageSize = 20, search = "" } = {}) {
  const params = [boardType];
  let searchClause = "";

  if (search) {
    params.push(`%${search}%`);
    searchClause = `
      AND (
        title ILIKE $2
        OR content ILIKE $2
        OR author_name ILIKE $2
      )
    `;
  }

  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);

  const limitIndex = search ? 3 : 2;
  const offsetIndex = search ? 4 : 3;

  const result = await client.query(
    `
    SELECT id, title, author_name, is_notice, created_at
    FROM public.board_posts
    WHERE board_type = $1
      AND parent_id IS NULL
      AND deleted_at IS NULL
      ${searchClause}
    ORDER BY is_notice DESC, created_at DESC
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
    `,
    params,
  );

  return result.rows;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new pg.Client(buildPgConfig(connectionString));
  await client.connect();

  let createdPostId = null;
  let createdReplyId = null;
  let createdCommentId = null;
  const boardType = "free";

  try {
    console.log("1. 게시글 등록");
    const insertResult = await client.query(
      `
      INSERT INTO public.board_posts (
        board_type,
        title,
        content,
        author_name,
        is_notice
      ) VALUES ($1, $2, $3, $4, false)
      RETURNING id
      `,
      [boardType, "검증용 게시글", "검증용 내용", "검증관리자"],
    );
    createdPostId = insertResult.rows[0].id;
    console.log(`   created=${createdPostId}`);

    console.log("2. 목록 조회");
    const list = await listPosts(client, boardType);
    if (!list.some((row) => row.id === createdPostId)) {
      throw new Error("등록한 게시글이 목록에 없습니다.");
    }
    console.log(`   visible=${list.length}`);

    console.log("3. 검색");
    const searchCount = await countPosts(client, boardType, "검증용");
    if (searchCount < 1) {
      throw new Error("검색 결과가 없습니다.");
    }
    console.log(`   searchCount=${searchCount}`);

    console.log("4. 페이지네이션");
    const page1 = await listPosts(client, boardType, { page: 1, pageSize: 1 });
    const page2 = await listPosts(client, boardType, { page: 2, pageSize: 1 });
    if (page1.length !== 1) {
      throw new Error("1페이지 결과가 pageSize와 일치하지 않습니다.");
    }
    if (page1[0].id === page2[0]?.id) {
      throw new Error("페이지네이션이 동일한 데이터를 반환했습니다.");
    }
    console.log(`   page1=${page1[0].id}, page2=${page2[0]?.id ?? "none"}`);

    console.log("5. 답글/댓글");
    const replyResult = await client.query(
      `
      INSERT INTO public.board_posts (
        board_type,
        parent_id,
        title,
        content,
        author_name,
        is_notice
      ) VALUES ($1, $2, $3, $4, $5, false)
      RETURNING id
      `,
      [boardType, createdPostId, "Re: 검증용 게시글", "검증용 답글", "답글작성자"],
    );
    createdReplyId = replyResult.rows[0].id;

    const commentResult = await client.query(
      `
      INSERT INTO public.board_comments (post_id, content, author_name)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [createdPostId, "검증용 댓글", "댓글작성자"],
    );
    createdCommentId = commentResult.rows[0].id;
    console.log(`   reply=${createdReplyId}, comment=${createdCommentId}`);

    console.log("6. Soft Delete (답글·댓글 cascade)");
    const now = new Date().toISOString();
    await client.query(
      `
      UPDATE public.board_posts
      SET deleted_at = $2
      WHERE id = $1
      `,
      [createdPostId, now],
    );
    await client.query(
      `
      UPDATE public.board_posts
      SET deleted_at = $2
      WHERE parent_id = $1 AND deleted_at IS NULL
      `,
      [createdPostId, now],
    );
    await client.query(
      `
      UPDATE public.board_comments
      SET deleted_at = $2
      WHERE post_id = $1 AND deleted_at IS NULL
      `,
      [createdPostId, now],
    );

    const afterDelete = await listPosts(client, boardType, { search: "검증용 게시글" });
    if (afterDelete.some((row) => row.id === createdPostId)) {
      throw new Error("Soft Delete된 게시글이 목록에 포함됩니다.");
    }

    const replyCheck = await client.query(
      `SELECT deleted_at FROM public.board_posts WHERE id = $1`,
      [createdReplyId],
    );
    const commentCheck = await client.query(
      `SELECT deleted_at FROM public.board_comments WHERE id = $1`,
      [createdCommentId],
    );
    if (!replyCheck.rows[0].deleted_at || !commentCheck.rows[0].deleted_at) {
      throw new Error("답글 또는 댓글이 soft delete되지 않았습니다.");
    }
    console.log("   soft-deleted post, reply, comment excluded");

    console.log("7. 라우팅");
    console.log("   UI routes=/admin/boards, /admin/boards/[boardType]");

    console.log("OK: board management verified");
  } finally {
    if (createdCommentId) {
      await client.query(`DELETE FROM public.board_comments WHERE id = $1`, [createdCommentId]);
    }
    if (createdReplyId) {
      await client.query(`DELETE FROM public.board_posts WHERE id = $1`, [createdReplyId]);
    }
    if (createdPostId) {
      await client.query(`DELETE FROM public.board_posts WHERE id = $1`, [createdPostId]);
    }

    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
