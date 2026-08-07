// 스캔 이미지 PDF의 한국어 OCR — macOS Vision 사용 (별도 설치 불필요)
//
//   swiftc -O scripts/ocr-pdf.swift -o /tmp/ocr-pdf
//   pdftoppm -r 200 -png "<원본>.pdf" /tmp/page
//   /tmp/ocr-pdf /tmp/page-*.png > /tmp/원본.txt
//   node scripts/parse-exam-blocks.mjs /tmp/원본.txt out.json
//
// 예상문제 원본 중 스캔본(텍스트 계층이 없는 PDF)이 여럿 있어 만들었습니다.
// pdftotext 가 0바이트를 뱉으면 이 경로로 돌리세요.
// 페이지 사이에는 \f(페이지 구분자)를 넣습니다 — 파서가 그대로 무시합니다.

import Foundation
import Vision
import AppKit

let args = CommandLine.arguments.dropFirst()
for path in args {
    guard let image = NSImage(contentsOfFile: path),
          let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        FileHandle.standardError.write("읽기 실패: \(path)\n".data(using: .utf8)!)
        continue
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLanguages = ["ko-KR", "en-US"]
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    try? handler.perform([request])
    let lines = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    print(lines.joined(separator: "\n"))
    print("\u{000C}")
}
