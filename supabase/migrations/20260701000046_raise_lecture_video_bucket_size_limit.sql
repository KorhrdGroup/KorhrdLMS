-- 차시 영상 업로드는 대용량(수백 MB~수 GB) MP4를 다뤄야 하므로, lecture-videos 버킷의
-- 오브젝트별 최대 업로드 용량을 2GB로 상향합니다. (기존에는 file_size_limit이 NULL이라
-- 프로젝트 전역 기본값(통상 50MB급)을 그대로 적용받아 대용량 업로드가 거부되었습니다.)
UPDATE storage.buckets
SET file_size_limit = 2147483648 -- 2 GiB
WHERE id = 'lecture-videos';
