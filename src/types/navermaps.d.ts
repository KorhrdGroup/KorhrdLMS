/**
 * 네이버 지도 Web Dynamic Map (maps.js v3) 전역 타입
 *
 * 오시는 길 지도에서 쓰는 것만 최소로 선언했습니다.
 * 지도 기능을 더 쓰게 되면 `@types/navermaps` 설치로 갈아타는 편이 낫습니다.
 * 문서: https://navermaps.github.io/maps.js.ncp/
 */
declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Map {
    constructor(
      element: HTMLElement | string,
      options?: {
        center?: LatLng;
        zoom?: number;
        /** 0: 없음, 1: 축소/확대 버튼, 2: 슬라이더 등 */
        zoomControl?: boolean;
        scrollWheel?: boolean;
      },
    );
    destroy(): void;
    setCenter(latlng: LatLng): void;
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map; title?: string });
    setMap(map: Map | null): void;
  }
}

interface Window {
  naver?: typeof naver;
}
