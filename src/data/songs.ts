// 자동 생성 파일 — scripts/build-songs.mjs 가 만든다. 직접 고치지 말 것.
// 곡번호는 공개 노래방 DB(api.manana.kr)에서 조회한 실제 TJ·금영 번호다.
export type Mood = 's' | 'f' | 'h' | 'd' | 'g' | 'p';
export type Genre = 'ballad' | 'dance' | 'hiphop' | 'rnb' | 'rock' | 'trot' | 'oldpop' | 'indie';

export interface Song {
  id: string;
  title: string;
  singer: string;
  /** TJ미디어 곡번호 (없으면 빈 문자열) */
  tj: string;
  /** 금영 곡번호 (없으면 빈 문자열) */
  ky: string;
  genre: Genre;
  moods: Mood[];
  era: number;
  /** 고음 난이도 1(편함) ~ 5(고음 지옥) */
  vocal: number;
  /** 인기 가중치 0~100 (싱픽 큐레이션 기준) */
  heat: number;
}

export const SONGS: Song[] = [
  {
    "id": "\uc544\uc774\uc720--\ubc24\ud3b8\uc9c0",
    "title": "\ubc24\ud3b8\uc9c0",
    "singer": "\uc544\uc774\uc720",
    "tj": "48879",
    "ky": "49492",
    "genre": "ballad",
    "moods": [
      "s",
      "d"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 92
  },
  {
    "id": "\uc724\ud558--\uc0ac\uac74\uc758-\uc9c0\ud3c9\uc120",
    "title": "\uc0ac\uac74\uc758 \uc9c0\ud3c9\uc120",
    "singer": "\uc724\ud558",
    "tj": "81425",
    "ky": "28707",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2020,
    "vocal": 5,
    "heat": 100
  },
  {
    "id": "\uc131\uc2dc\uacbd--\ub108\uc758-\ubaa8\ub4e0-\uc21c\uac04",
    "title": "\ub108\uc758 \ubaa8\ub4e0 \uc21c\uac04",
    "singer": "\uc131\uc2dc\uacbd",
    "tj": "42122",
    "ky": "48367",
    "genre": "ballad",
    "moods": [
      "s",
      "d"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 90
  },
  {
    "id": "\uc774\ucc3d\uc12d--\ucc9c\uc0c1\uc5f0",
    "title": "\ucc9c\uc0c1\uc5f0",
    "singer": "\uc774\ucc3d\uc12d",
    "tj": "86059",
    "ky": "82628",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2020,
    "vocal": 5,
    "heat": 98
  },
  {
    "id": "\uc784\uc601\uc6c5--\uc0ac\ub791\uc740-\ub298-\ub3c4\ub9dd\uac00",
    "title": "\uc0ac\ub791\uc740 \ub298 \ub3c4\ub9dd\uac00",
    "singer": "\uc784\uc601\uc6c5",
    "tj": "80548",
    "ky": "23291",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 97
  },
  {
    "id": "\uc544\uc774\uc720--\uc88b\uc740-\ub0a0",
    "title": "\uc88b\uc740 \ub0a0",
    "singer": "\uc544\uc774\uc720",
    "tj": "33393",
    "ky": "76754",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2010,
    "vocal": 5,
    "heat": 95
  },
  {
    "id": "\uc784\uc601\uc6c5--\ubcc4\ube5b-\uac19\uc740-\ub098\uc758-\uc0ac\ub791\uc544",
    "title": "\ubcc4\ube5b \uac19\uc740 \ub098\uc758 \uc0ac\ub791\uc544",
    "singer": "\uc784\uc601\uc6c5",
    "tj": "76523",
    "ky": "22669",
    "genre": "trot",
    "moods": [
      "p",
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 88
  },
  {
    "id": "\ubc15\uc7ac\uc815--\ud5e4\uc5b4\uc9c0\uc790-\ub9d0\ud574\uc694",
    "title": "\ud5e4\uc5b4\uc9c0\uc790 \ub9d0\ud574\uc694",
    "singer": "\ubc15\uc7ac\uc815",
    "tj": "83490",
    "ky": "29234",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 96
  },
  {
    "id": "\uae40\ubbfc\uc11d--\ucde8\uc911\uace0\ubc31",
    "title": "\ucde8\uc911\uace0\ubc31",
    "singer": "\uae40\ubbfc\uc11d",
    "tj": "80906",
    "ky": "23505",
    "genre": "ballad",
    "moods": [
      "s",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 93
  },
  {
    "id": "\uba5c\ub85c\ub9dd\uc2a4--\uc0ac\ub791\uc778\uac00-\ubd10",
    "title": "\uc0ac\ub791\uc778\uac00 \ubd10",
    "singer": "\uba5c\ub85c\ub9dd\uc2a4",
    "tj": "81242",
    "ky": "28645",
    "genre": "ballad",
    "moods": [
      "d",
      "s"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 88
  },
  {
    "id": "\uba5c\ub85c\ub9dd\uc2a4--\uc120\ubb3c",
    "title": "\uc120\ubb3c",
    "singer": "\uba5c\ub85c\ub9dd\uc2a4",
    "tj": "49941",
    "ky": "49594",
    "genre": "ballad",
    "moods": [
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\ud3f4\ud0b4--\ubaa8\ub4e0-\ub0a0-\ubaa8\ub4e0-\uc21c\uac04",
    "title": "\ubaa8\ub4e0 \ub0a0, \ubaa8\ub4e0 \uc21c\uac04",
    "singer": "\ud3f4\ud0b4",
    "tj": "97511",
    "ky": "91478",
    "genre": "ballad",
    "moods": [
      "d",
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "\ud3f4\ud0b4--\ub108\ub97c-\ub9cc\ub098",
    "title": "\ub108\ub97c \ub9cc\ub098",
    "singer": "\ud3f4\ud0b4",
    "tj": "62611",
    "ky": "92439",
    "genre": "ballad",
    "moods": [
      "d",
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 82
  },
  {
    "id": "\uc784\uc601\uc6c5--\uc774\uc81c-\ub098\ub9cc-\ubbff\uc5b4\uc694",
    "title": "\uc774\uc81c \ub098\ub9cc \ubbff\uc5b4\uc694",
    "singer": "\uc784\uc601\uc6c5",
    "tj": "89266",
    "ky": "27628",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 90
  },
  {
    "id": "\uc774\ubb34\uc9c4--\uc2e0\ud638\ub4f1",
    "title": "\uc2e0\ud638\ub4f1",
    "singer": "\uc774\ubb34\uc9c4",
    "tj": "76890",
    "ky": "22924",
    "genre": "indie",
    "moods": [
      "f",
      "s"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 85
  },
  {
    "id": "\uc774\ubb34\uc9c4--\uc5d0\ud53c\uc18c\ub4dc",
    "title": "\uc5d0\ud53c\uc18c\ub4dc",
    "singer": "\uc774\ubb34\uc9c4",
    "tj": "85525",
    "ky": "",
    "genre": "indie",
    "moods": [
      "s",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 76
  },
  {
    "id": "\ub9c8\ud06c\ud23d--\uc624\ub298\ub3c4-\ube5b\ub098\ub294-\ub108\uc5d0\uac8c",
    "title": "\uc624\ub298\ub3c4 \ube5b\ub098\ub294 \ub108\uc5d0\uac8c",
    "singer": "\ub9c8\ud06c\ud23d",
    "tj": "81312",
    "ky": "23735",
    "genre": "ballad",
    "moods": [
      "s",
      "d"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 72
  },
  {
    "id": "\uc784\uc7ac\ud604--\uc0ac\ub791\uc5d0-\uc5f0\uc2b5\uc774-\uc788\uc5c8\ub2e4\uba74",
    "title": "\uc0ac\ub791\uc5d0 \uc5f0\uc2b5\uc774 \uc788\uc5c8\ub2e4\uba74",
    "singer": "\uc784\uc7ac\ud604",
    "tj": "62660",
    "ky": "97871",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 86
  },
  {
    "id": "\ud5e4\uc774\uc988--\ube44\ub3c4-\uc624\uace0-\uadf8\ub798\uc11c",
    "title": "\ube44\ub3c4 \uc624\uace0 \uadf8\ub798\uc11c",
    "singer": "\ud5e4\uc774\uc988",
    "tj": "49834",
    "ky": "90302",
    "genre": "rnb",
    "moods": [
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc544\uc774\uc720--love-wins-all",
    "title": "Love wins all",
    "singer": "\uc544\uc774\uc720",
    "tj": "85842",
    "ky": "80783",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2020,
    "vocal": 5,
    "heat": 88
  },
  {
    "id": "\uc544\uc774\uc720--blueming",
    "title": "Blueming",
    "singer": "\uc544\uc774\uc720",
    "tj": "24518",
    "ky": "21290",
    "genre": "dance",
    "moods": [
      "f",
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 82
  },
  {
    "id": "\uc544\uc774\uc720--\uc090\uc090",
    "title": "\uc090\uc090",
    "singer": "\uc544\uc774\uc720",
    "tj": "98620",
    "ky": "92373",
    "genre": "dance",
    "moods": [
      "f"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\uc544\uc774\uc720--\ud314\ub808\ud2b8",
    "title": "\ud314\ub808\ud2b8",
    "singer": "\uc544\uc774\uc720",
    "tj": "49495",
    "ky": "49524",
    "genre": "rnb",
    "moods": [
      "f",
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "akmu--love-lee",
    "title": "Love Lee",
    "singer": "AKMU",
    "tj": "84442",
    "ky": "",
    "genre": "dance",
    "moods": [
      "f",
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\ube44\ube44--\ubc24\uc591\uac31",
    "title": "\ubc24\uc591\uac31",
    "singer": "\ube44\ube44",
    "tj": "85963",
    "ky": "80930",
    "genre": "rnb",
    "moods": [
      "s"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc544\uc774\uc720--\uc5d0\uc787",
    "title": "\uc5d0\uc787",
    "singer": "\uc544\uc774\uc720",
    "tj": "89419",
    "ky": "27777",
    "genre": "dance",
    "moods": [
      "f",
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "10cm--\ud3f0\uc11c\ud2b8",
    "title": "\ud3f0\uc11c\ud2b8",
    "singer": "10CM",
    "tj": "96391",
    "ky": "90497",
    "genre": "indie",
    "moods": [
      "d",
      "f"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 76
  },
  {
    "id": "\uc0b0\uc6b8\ub9bc--\ub108\uc758-\uc758\ubbf8",
    "title": "\ub108\uc758 \uc758\ubbf8",
    "singer": "\uc0b0\uc6b8\ub9bc",
    "tj": "2969",
    "ky": "",
    "genre": "rock",
    "moods": [
      "s",
      "p"
    ],
    "era": 1980,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "\uc544\uc774\uc720--\uac00\uc744-\uc544\uce68",
    "title": "\uac00\uc744 \uc544\uce68",
    "singer": "\uc544\uc774\uc720",
    "tj": "96499",
    "ky": "49673",
    "genre": "indie",
    "moods": [
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uc591\ud64d\uc6d0--\uc0ac\uacc4",
    "title": "\uc0ac\uacc4",
    "singer": "\uc591\ud64d\uc6d0",
    "tj": "77358",
    "ky": "22974",
    "genre": "hiphop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 90
  },
  {
    "id": "\uc591\ud64d\uc6d0--\uac00\uba74\ubb34\ub3c4\ud68c",
    "title": "\uac00\uba74\ubb34\ub3c4\ud68c",
    "singer": "\uc591\ud64d\uc6d0",
    "tj": "42965",
    "ky": "",
    "genre": "hiphop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 84
  },
  {
    "id": "\ubbf8\ub780\uc774--vvs",
    "title": "VVS",
    "singer": "\ubbf8\ub780\uc774",
    "tj": "75984",
    "ky": "28274",
    "genre": "hiphop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 78
  },
  {
    "id": "\uc6b0\uc6d0\uc7ac--\uc2dc\ucc28",
    "title": "\uc2dc\ucc28",
    "singer": "\uc6b0\uc6d0\uc7ac",
    "tj": "96398",
    "ky": "90515",
    "genre": "hiphop",
    "moods": [
      "f"
    ],
    "era": 2010,
    "vocal": 2,
    "heat": 70
  },
  {
    "id": "\ube44\uc640\uc774--\uc790\ud654\uc0c1",
    "title": "\uc790\ud654\uc0c1",
    "singer": "\ube44\uc640\uc774",
    "tj": "48049",
    "ky": "88756",
    "genre": "hiphop",
    "moods": [
      "f"
    ],
    "era": 2010,
    "vocal": 2,
    "heat": 68
  },
  {
    "id": "\uc1a1\ubbfc\ud638--\uc544\ub099\ub124",
    "title": "\uc544\ub099\ub124",
    "singer": "\uc1a1\ubbfc\ud638",
    "tj": "62637",
    "ky": "92587",
    "genre": "hiphop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2010,
    "vocal": 2,
    "heat": 70
  },
  {
    "id": "\ub2e4\uc774\ub098\ubbf9-\ub4c0\uc624--\ucd9c\uccb5",
    "title": "\ucd9c\uccb5",
    "singer": "\ub2e4\uc774\ub098\ubbf9 \ub4c0\uc624",
    "tj": "18042",
    "ky": "45957",
    "genre": "hiphop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2000,
    "vocal": 2,
    "heat": 64
  },
  {
    "id": "\ud3f4\ud0b4--\ube44",
    "title": "\ube44",
    "singer": "\ud3f4\ud0b4",
    "tj": "48549",
    "ky": "88921",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\ub2e4\uc774\ub098\ubbf9-\ub4c0\uc624--\uc8fd\uc77c-\ub188",
    "title": "\uc8fd\uc77c \ub188",
    "singer": "\ub2e4\uc774\ub098\ubbf9 \ub4c0\uc624",
    "tj": "31729",
    "ky": "84559",
    "genre": "hiphop",
    "moods": [
      "f"
    ],
    "era": 2000,
    "vocal": 2,
    "heat": 70
  },
  {
    "id": "\uc5d0\uc2a4\ud30c--drama",
    "title": "Drama",
    "singer": "\uc5d0\uc2a4\ud30c",
    "tj": "85275",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 88
  },
  {
    "id": "\uc5d0\uc2a4\ud30c--next-level",
    "title": "Next Level",
    "singer": "\uc5d0\uc2a4\ud30c",
    "tj": "76842",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 86
  },
  {
    "id": "\ub2e4\uc774\ub098\ubbf9-\ub4c0\uc624--\uace0\ubc31",
    "title": "\uace0\ubc31",
    "singer": "\ub2e4\uc774\ub098\ubbf9 \ub4c0\uc624",
    "tj": "15388",
    "ky": "69650",
    "genre": "hiphop",
    "moods": [
      "f",
      "d"
    ],
    "era": 2010,
    "vocal": 2,
    "heat": 66
  },
  {
    "id": "\uc5d0\uc2a4\ud30c--spicy",
    "title": "Spicy",
    "singer": "\uc5d0\uc2a4\ud30c",
    "tj": "83561",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\uc5d0\uc2a4\ud30c--supernova",
    "title": "Supernova",
    "singer": "\uc5d0\uc2a4\ud30c",
    "tj": "86820",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 96
  },
  {
    "id": "\ub274\uc9c4\uc2a4--hype-boy",
    "title": "Hype Boy",
    "singer": "\ub274\uc9c4\uc2a4",
    "tj": "82072",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 94
  },
  {
    "id": "\ub274\uc9c4\uc2a4--attention",
    "title": "Attention",
    "singer": "\ub274\uc9c4\uc2a4",
    "tj": "82071",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 86
  },
  {
    "id": "\ub274\uc9c4\uc2a4--ditto",
    "title": "Ditto",
    "singer": "\ub274\uc9c4\uc2a4",
    "tj": "82802",
    "ky": "",
    "genre": "dance",
    "moods": [
      "f",
      "d"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 90
  },
  {
    "id": "\ub274\uc9c4\uc2a4--super-shy",
    "title": "Super Shy",
    "singer": "\ub274\uc9c4\uc2a4",
    "tj": "84091",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 84
  },
  {
    "id": "\uc544\uc774\ube0c--love-dive",
    "title": "LOVE DIVE",
    "singer": "\uc544\uc774\ube0c",
    "tj": "81453",
    "ky": "23823",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 90
  },
  {
    "id": "\uc544\uc774\ube0c--after-like",
    "title": "After LIKE",
    "singer": "\uc544\uc774\ube0c",
    "tj": "82156",
    "ky": "28887",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "\ub974\uc138\ub77c\ud54c--antifragile",
    "title": "ANTIFRAGILE",
    "singer": "\ub974\uc138\ub77c\ud54c",
    "tj": "82467",
    "ky": "28959",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 86
  },
  {
    "id": "\ub974\uc138\ub77c\ud54c--perfect-night",
    "title": "Perfect Night",
    "singer": "\ub974\uc138\ub77c\ud54c",
    "tj": "85165",
    "ky": "80997",
    "genre": "dance",
    "moods": [
      "f",
      "d"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 82
  },
  {
    "id": "\ub974\uc138\ub77c\ud54c--unforgiven",
    "title": "UNFORGIVEN",
    "singer": "\ub974\uc138\ub77c\ud54c",
    "tj": "83533",
    "ky": "96994",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 76
  },
  {
    "id": "\ub974\uc138\ub77c\ud54c--easy",
    "title": "EASY",
    "singer": "\ub974\uc138\ub77c\ud54c",
    "tj": "86027",
    "ky": "53269",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc544\uc774\ube0c--i-am",
    "title": "I AM",
    "singer": "\uc544\uc774\ube0c",
    "tj": "83434",
    "ky": "29221",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 88
  },
  {
    "id": "\ud2b8\uc640\uc774\uc2a4--feel-special",
    "title": "Feel Special",
    "singer": "\ud2b8\uc640\uc774\uc2a4",
    "tj": "24166",
    "ky": "",
    "genre": "dance",
    "moods": [
      "f",
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\ud2b8\uc640\uc774\uc2a4--cheer-up",
    "title": "CHEER UP",
    "singer": "\ud2b8\uc640\uc774\uc2a4",
    "tj": "46337",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\ud2b8\uc640\uc774\uc2a4--fancy",
    "title": "FANCY",
    "singer": "\ud2b8\uc640\uc774\uc2a4",
    "tj": "53869",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\ube14\ub799\ud551\ud06c--\ub69c\ub450\ub69c\ub450",
    "title": "\ub69c\ub450\ub69c\ub450",
    "singer": "\ube14\ub799\ud551\ud06c",
    "tj": "97986",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 88
  },
  {
    "id": "\ube14\ub799\ud551\ud06c--how-you-like-that",
    "title": "How You Like That",
    "singer": "\ube14\ub799\ud551\ud06c",
    "tj": "75262",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "\ube14\ub799\ud551\ud06c--pink-venom",
    "title": "Pink Venom",
    "singer": "\ube14\ub799\ud551\ud06c",
    "tj": "82138",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\ubc29\ud0c4\uc18c\ub144\ub2e8--dynamite",
    "title": "Dynamite",
    "singer": "\ubc29\ud0c4\uc18c\ub144\ub2e8",
    "tj": "75520",
    "ky": "28017",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 92
  },
  {
    "id": "\ubc29\ud0c4\uc18c\ub144\ub2e8--\ubd04\ub0a0",
    "title": "\ubd04\ub0a0",
    "singer": "\ubc29\ud0c4\uc18c\ub144\ub2e8",
    "tj": "48636",
    "ky": "49445",
    "genre": "dance",
    "moods": [
      "s",
      "f"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 90
  },
  {
    "id": "\ubc29\ud0c4\uc18c\ub144\ub2e8--\uc791\uc740-\uac83\ub4e4\uc744-\uc704\ud55c-\uc2dc",
    "title": "\uc791\uc740 \uac83\ub4e4\uc744 \uc704\ud55c \uc2dc",
    "singer": "\ubc29\ud0c4\uc18c\ub144\ub2e8",
    "tj": "53816",
    "ky": "97888",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "\ubc29\ud0c4\uc18c\ub144\ub2e8--butter",
    "title": "Butter",
    "singer": "\ubc29\ud0c4\uc18c\ub144\ub2e8",
    "tj": "76860",
    "ky": "22906",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 84
  },
  {
    "id": "\uc5d1\uc18c--\uc73c\ub974\ub801",
    "title": "\uc73c\ub974\ub801",
    "singer": "\uc5d1\uc18c",
    "tj": "37193",
    "ky": "77713",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 82
  },
  {
    "id": "\uc5d1\uc18c--love-shot",
    "title": "Love Shot",
    "singer": "\uc5d1\uc18c",
    "tj": "98994",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\ubc29\ud0c4\uc18c\ub144\ub2e8--dna",
    "title": "DNA",
    "singer": "\ubc29\ud0c4\uc18c\ub144\ub2e8",
    "tj": "96507",
    "ky": "49677",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 76
  },
  {
    "id": "\uc5d1\uc18c--\uccab-\ub208",
    "title": "\uccab \ub208",
    "singer": "\uc5d1\uc18c",
    "tj": "37765",
    "ky": "59196",
    "genre": "ballad",
    "moods": [
      "d",
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc138\ube10\ud2f4--\uc544\uc8fc-nice",
    "title": "\uc544\uc8fc NICE",
    "singer": "\uc138\ube10\ud2f4",
    "tj": "46638",
    "ky": "78893",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\uc138\ube10\ud2f4--\uc190\uc624\uacf5",
    "title": "\uc190\uc624\uacf5",
    "singer": "\uc138\ube10\ud2f4",
    "tj": "83506",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 76
  },
  {
    "id": "\ud2b8\uc640\uc774\uc2a4--tt",
    "title": "TT",
    "singer": "\ud2b8\uc640\uc774\uc2a4",
    "tj": "48115",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 82
  },
  {
    "id": "\uc2a4\ud2b8\ub808\uc774-\ud0a4\uc988--\uc2e0\uba54\ub274",
    "title": "\uc2e0\uba54\ub274",
    "singer": "\uc2a4\ud2b8\ub808\uc774 \ud0a4\uc988",
    "tj": "75220",
    "ky": "27850",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "\uc788\uc9c0--\ub2ec\ub77c\ub2ec\ub77c",
    "title": "\ub2ec\ub77c\ub2ec\ub77c",
    "singer": "\uc788\uc9c0",
    "tj": "62675",
    "ky": "79762",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc788\uc9c0--wannabe",
    "title": "WANNABE",
    "singer": "\uc788\uc9c0",
    "tj": "89142",
    "ky": "21590",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "\ub808\ub4dc\ubca8\ubcb3--psycho",
    "title": "Psycho",
    "singer": "\ub808\ub4dc\ubca8\ubcb3",
    "tj": "24760",
    "ky": "27358",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 78
  },
  {
    "id": "\ub518--d",
    "title": "D",
    "singer": "\ub518",
    "tj": "46227",
    "ky": "78668",
    "genre": "rnb",
    "moods": [
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 62
  },
  {
    "id": "\ud0dc\uc5f0--\uc0ac\uacc4",
    "title": "\uc0ac\uacc4",
    "singer": "\ud0dc\uc5f0",
    "tj": "53710",
    "ky": "97132",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 80
  },
  {
    "id": "\ud0dc\uc5f0--fine",
    "title": "Fine",
    "singer": "\ud0dc\uc5f0",
    "tj": "48733",
    "ky": "76317",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 72
  },
  {
    "id": "\ud0dc\uc5f0--invu",
    "title": "INVU",
    "singer": "\ud0dc\uc5f0",
    "tj": "81205",
    "ky": "23654",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 70
  },
  {
    "id": "\uc18c\ub140\uc2dc\ub300--gee",
    "title": "Gee",
    "singer": "\uc18c\ub140\uc2dc\ub300",
    "tj": "30627",
    "ky": "84011",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc18c\ub140\uc2dc\ub300--\ub2e4\uc2dc-\ub9cc\ub09c-\uc138\uacc4",
    "title": "\ub2e4\uc2dc \ub9cc\ub09c \uc138\uacc4",
    "singer": "\uc18c\ub140\uc2dc\ub300",
    "tj": "18470",
    "ky": "46023",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\uc6d0\ub354\uac78\uc2a4--nobody",
    "title": "Nobody",
    "singer": "\uc6d0\ub354\uac78\uc2a4",
    "tj": "30191",
    "ky": "46428",
    "genre": "dance",
    "moods": [
      "h",
      "d"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc6d0\ub354\uac78\uc2a4--tell-me",
    "title": "Tell Me",
    "singer": "\uc6d0\ub354\uac78\uc2a4",
    "tj": "18619",
    "ky": "83136",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2000,
    "vocal": 2,
    "heat": 76
  },
  {
    "id": "\ube45\ubc45--fantastic-baby",
    "title": "Fantastic Baby",
    "singer": "\ube45\ubc45",
    "tj": "35073",
    "ky": "77196",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 86
  },
  {
    "id": "\ube45\ubc45--\uac70\uc9d3\ub9d0",
    "title": "\uac70\uc9d3\ub9d0",
    "singer": "\ube45\ubc45",
    "tj": "18553",
    "ky": "46034",
    "genre": "dance",
    "moods": [
      "h",
      "s"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 82
  },
  {
    "id": "\uce74\ub77c--\ubbf8\uc2a4\ud130",
    "title": "\ubbf8\uc2a4\ud130",
    "singer": "\uce74\ub77c",
    "tj": "31473",
    "ky": "84409",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "2ne1--\ub0b4\uac00-\uc81c\uc77c-\uc798-\ub098\uac00",
    "title": "\ub0b4\uac00 \uc81c\uc77c \uc798 \ub098\uac00",
    "singer": "2NE1",
    "tj": "34084",
    "ky": "47425",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "2ne1--i-don-t-care",
    "title": "I Don't Care",
    "singer": "2NE1",
    "tj": "",
    "ky": "46712",
    "genre": "dance",
    "moods": [
      "f",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 66
  },
  {
    "id": "\ube45\ubc45--\ud558\ub8e8\ud558\ub8e8",
    "title": "\ud558\ub8e8\ud558\ub8e8",
    "singer": "\ube45\ubc45",
    "tj": "19974",
    "ky": "83751",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 84
  },
  {
    "id": "\ube45\ubc45--\ub9c8\uc9c0\ub9c9-\uc778\uc0ac",
    "title": "\ub9c8\uc9c0\ub9c9 \uc778\uc0ac",
    "singer": "\ube45\ubc45",
    "tj": "18901",
    "ky": "46125",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 78
  },
  {
    "id": "\ube45\ubc45--\ubc45\ubc45\ubc45",
    "title": "\ubc45\ubc45\ubc45",
    "singer": "\ube45\ubc45",
    "tj": "29337",
    "ky": "48841",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 92
  },
  {
    "id": "\uc288\ud37c\uc8fc\ub2c8\uc5b4--\ubbf8\uc778\uc544",
    "title": "\ubbf8\uc778\uc544",
    "singer": "\uc288\ud37c\uc8fc\ub2c8\uc5b4",
    "tj": "32575",
    "ky": "47015",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\uc288\ud37c\uc8fc\ub2c8\uc5b4--\uc3d8\ub9ac-\uc3d8\ub9ac",
    "title": "\uc3d8\ub9ac \uc3d8\ub9ac",
    "singer": "\uc288\ud37c\uc8fc\ub2c8\uc5b4",
    "tj": "",
    "ky": "84145",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "god--\ud558\ub298\uc0c9-\ud48d\uc120",
    "title": "\ud558\ub298\uc0c9 \ud48d\uc120",
    "singer": "god",
    "tj": "9287",
    "ky": "6692",
    "genre": "dance",
    "moods": [
      "d",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "god--\uc5b4\uba38\ub2d8\uaed8",
    "title": "\uc5b4\uba38\ub2d8\uaed8",
    "singer": "god",
    "tj": "4988",
    "ky": "",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 74
  },
  {
    "id": "god--\ucd1b\ubd88\ud558\ub098",
    "title": "\ucd1b\ubd88\ud558\ub098",
    "singer": "god",
    "tj": "9247",
    "ky": "6596",
    "genre": "ballad",
    "moods": [
      "p",
      "h"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\ucfe8--\ud574\ubcc0\uc758-\uc5ec\uc778",
    "title": "\ud574\ubcc0\uc758 \uc5ec\uc778",
    "singer": "\ucfe8",
    "tj": "3956",
    "ky": "5036",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\ucfe8--\uc544\ub85c\ud558",
    "title": "\uc544\ub85c\ud558",
    "singer": "\ucfe8",
    "tj": "9733",
    "ky": "7660",
    "genre": "ballad",
    "moods": [
      "d",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "dj-doc--\uc5ec\ub984-\uc774\uc57c\uae30",
    "title": "\uc5ec\ub984 \uc774\uc57c\uae30",
    "singer": "DJ DOC",
    "tj": "3198",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\uc5c4\uc815\ud654--\ucd08\ub300",
    "title": "\ucd08\ub300",
    "singer": "\uc5c4\uc815\ud654",
    "tj": "4777",
    "ky": "5613",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 64
  },
  {
    "id": "\uc11c\ud0dc\uc9c0\uc640-\uc544\uc774\ub4e4--\ub09c-\uc54c\uc544\uc694",
    "title": "\ub09c \uc54c\uc544\uc694",
    "singer": "\uc11c\ud0dc\uc9c0\uc640 \uc544\uc774\ub4e4",
    "tj": "1294",
    "ky": "1296",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uc774\uc815\ud604--\uc640",
    "title": "\uc640",
    "singer": "\uc774\uc815\ud604",
    "tj": "13775",
    "ky": "68453",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 62
  },
  {
    "id": "\ubc84\uc988--\uac81\uc7c1\uc774",
    "title": "\uac81\uc7c1\uc774",
    "singer": "\ubc84\uc988",
    "tj": "14657",
    "ky": "45151",
    "genre": "rock",
    "moods": [
      "g",
      "p"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 90
  },
  {
    "id": "\uae40\ud604\uc815--\uadf8\ub140\uc640\uc758-\uc774\ubcc4",
    "title": "\uadf8\ub140\uc640\uc758 \uc774\ubcc4",
    "singer": "\uae40\ud604\uc815",
    "tj": "4635",
    "ky": "5511",
    "genre": "dance",
    "moods": [
      "h",
      "g"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 66
  },
  {
    "id": "\ubc84\uc988--\ub0a8\uc790\ub97c-\ubab0\ub77c",
    "title": "\ub0a8\uc790\ub97c \ubab0\ub77c",
    "singer": "\ubc84\uc988",
    "tj": "15978",
    "ky": "85068",
    "genre": "rock",
    "moods": [
      "g",
      "h"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 82
  },
  {
    "id": "h-o-t--\ube5b",
    "title": "\ube5b",
    "singer": "H.O.T",
    "tj": "4789",
    "ky": "",
    "genre": "dance",
    "moods": [
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 68
  },
  {
    "id": "\ubc84\uc988--\uc0ac\ub791\uc740-\uac00\uc2b4\uc774-\uc2dc\ud0a8\ub2e4",
    "title": "\uc0ac\ub791\uc740 \uac00\uc2b4\uc774 \uc2dc\ud0a8\ub2e4",
    "singer": "\ubc84\uc988",
    "tj": "15442",
    "ky": "45988",
    "genre": "rock",
    "moods": [
      "g",
      "s"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 80
  },
  {
    "id": "\ubc84\uc988--\ub098\uc5d0\uac8c\ub85c-\ub5a0\ub098\ub294-\uc5ec\ud589",
    "title": "\ub098\uc5d0\uac8c\ub85c \ub5a0\ub098\ub294 \uc5ec\ud589",
    "singer": "\ubc84\uc988",
    "tj": "14828",
    "ky": "45229",
    "genre": "rock",
    "moods": [
      "f",
      "h"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 78
  },
  {
    "id": "\ub370\uc774\uc2dd\uc2a4--\ud55c-\ud398\uc774\uc9c0\uac00-\ub420-\uc218-\uc788\uac8c",
    "title": "\ud55c \ud398\uc774\uc9c0\uac00 \ub420 \uc218 \uc788\uac8c",
    "singer": "\ub370\uc774\uc2dd\uc2a4",
    "tj": "64304",
    "ky": "79967",
    "genre": "rock",
    "moods": [
      "f",
      "g"
    ],
    "era": 2020,
    "vocal": 4,
    "heat": 90
  },
  {
    "id": "\ub370\uc774\uc2dd\uc2a4--\ub179\uc544\ub0b4\ub824\uc694",
    "title": "\ub179\uc544\ub0b4\ub824\uc694",
    "singer": "\ub370\uc774\uc2dd\uc2a4",
    "tj": "43288",
    "ky": "",
    "genre": "rock",
    "moods": [
      "s",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 76
  },
  {
    "id": "\ub370\uc774\uc2dd\uc2a4--congratulations",
    "title": "Congratulations",
    "singer": "\ub370\uc774\uc2dd\uc2a4",
    "tj": "29764",
    "ky": "",
    "genre": "rock",
    "moods": [
      "g",
      "s"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 72
  },
  {
    "id": "\ub370\uc774\uc2dd\uc2a4--\uc608\ubee4\uc5b4",
    "title": "\uc608\ubee4\uc5b4",
    "singer": "\ub370\uc774\uc2dd\uc2a4",
    "tj": "48585",
    "ky": "49447",
    "genre": "rock",
    "moods": [
      "s",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 84
  },
  {
    "id": "ft\uc544\uc77c\ub79c\ub4dc--\uc9c0\ub3c5\ud558\uac8c",
    "title": "\uc9c0\ub3c5\ud558\uac8c",
    "singer": "FT\uc544\uc77c\ub79c\ub4dc",
    "tj": "34948",
    "ky": "47639",
    "genre": "rock",
    "moods": [
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 66
  },
  {
    "id": "\ub12c--\uae30\uc5b5\uc744-\uac77\ub294-\uc2dc\uac04",
    "title": "\uae30\uc5b5\uc744 \uac77\ub294 \uc2dc\uac04",
    "singer": "\ub12c",
    "tj": "19390",
    "ky": "",
    "genre": "rock",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 70
  },
  {
    "id": "\uc528\uc5d4\ube14\ub8e8--\uc678\ud1a8\uc774\uc57c",
    "title": "\uc678\ud1a8\uc774\uc57c",
    "singer": "\uc528\uc5d4\ube14\ub8e8",
    "tj": "32118",
    "ky": "46905",
    "genre": "rock",
    "moods": [
      "h",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 74
  },
  {
    "id": "ft\uc544\uc77c\ub79c\ub4dc--\uc0ac\ub791\uc553\uc774",
    "title": "\uc0ac\ub791\uc553\uc774",
    "singer": "FT\uc544\uc77c\ub79c\ub4dc",
    "tj": "18104",
    "ky": "45962",
    "genre": "rock",
    "moods": [
      "d",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 70
  },
  {
    "id": "\uc790\uc6b0\ub9bc--\ud558\ud558\ud558\uc3ed",
    "title": "\ud558\ud558\ud558\uc3ed",
    "singer": "\uc790\uc6b0\ub9bc",
    "tj": "14078",
    "ky": "45017",
    "genre": "rock",
    "moods": [
      "h",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc790\uc6b0\ub9bc--\uc2a4\ubb3c\ub2e4\uc12f-\uc2a4\ubb3c\ud558\ub098",
    "title": "\uc2a4\ubb3c\ub2e4\uc12f, \uc2a4\ubb3c\ud558\ub098",
    "singer": "\uc790\uc6b0\ub9bc",
    "tj": "37545",
    "ky": "48246",
    "genre": "rock",
    "moods": [
      "s"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 74
  },
  {
    "id": "\uc724\ub3c4\ud604--\uc0ac\ub791\ud588\ub098\ubd10",
    "title": "\uc0ac\ub791\ud588\ub098\ubd10",
    "singer": "\uc724\ub3c4\ud604",
    "tj": "14832",
    "ky": "45202",
    "genre": "rock",
    "moods": [
      "g",
      "p"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 78
  },
  {
    "id": "\uc720\uc7ac\ud558--\uc0ac\ub791\ud558\uae30-\ub54c\ubb38\uc5d0",
    "title": "\uc0ac\ub791\ud558\uae30 \ub54c\ubb38\uc5d0",
    "singer": "\uc720\uc7ac\ud558",
    "tj": "241",
    "ky": "1679",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 64
  },
  {
    "id": "\uc2e0\uc131\uc6b0--\uc11c\uc2dc",
    "title": "\uc11c\uc2dc",
    "singer": "\uc2e0\uc131\uc6b0",
    "tj": "2135",
    "ky": "3446",
    "genre": "rock",
    "moods": [
      "s",
      "g"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 62
  },
  {
    "id": "\uc720\uc7ac\ud558--\uadf8\ub300-\ub0b4-\ud488\uc5d0",
    "title": "\uadf8\ub300 \ub0b4 \ud488\uc5d0",
    "singer": "\uc720\uc7ac\ud558",
    "tj": "12766",
    "ky": "98266",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uc804\ub78c\ud68c--\uae30\uc5b5\uc758-\uc2b5\uc791",
    "title": "\uae30\uc5b5\uc758 \uc2b5\uc791",
    "singer": "\uc804\ub78c\ud68c",
    "tj": "2200",
    "ky": "3462",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 68
  },
  {
    "id": "\uc804\ub78c\ud68c--\ucde8\uc911\uc9c4\ub2f4",
    "title": "\ucde8\uc911\uc9c4\ub2f4",
    "singer": "\uc804\ub78c\ud68c",
    "tj": "3134",
    "ky": "4772",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "\uae40\uad11\uc11d--\uc11c\ub978-\uc988\uc74c\uc5d0",
    "title": "\uc11c\ub978 \uc988\uc74c\uc5d0",
    "singer": "\uae40\uad11\uc11d",
    "tj": "2337",
    "ky": "4448",
    "genre": "ballad",
    "moods": [
      "s",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 88
  },
  {
    "id": "\uae40\uad11\uc11d--\uba3c\uc9c0\uac00-\ub418\uc5b4",
    "title": "\uba3c\uc9c0\uac00 \ub418\uc5b4",
    "singer": "\uae40\uad11\uc11d",
    "tj": "10354",
    "ky": "62285",
    "genre": "ballad",
    "moods": [
      "f",
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\uae40\uad11\uc11d--\uc774\ub4f1\ubcd1\uc758-\ud3b8\uc9c0",
    "title": "\uc774\ub4f1\ubcd1\uc758 \ud3b8\uc9c0",
    "singer": "\uae40\uad11\uc11d",
    "tj": "1999",
    "ky": "3425",
    "genre": "ballad",
    "moods": [
      "p",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uae40\uad11\uc11d--\uc78a\uc5b4\uc57c-\ud55c\ub2e4\ub294-\ub9c8\uc74c\uc73c\ub85c",
    "title": "\uc78a\uc5b4\uc57c \ud55c\ub2e4\ub294 \ub9c8\uc74c\uc73c\ub85c",
    "singer": "\uae40\uad11\uc11d",
    "tj": "2141",
    "ky": "2787",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 62
  },
  {
    "id": "\uc774\ubb38\uc138--\ubd89\uc740-\ub178\uc744",
    "title": "\ubd89\uc740 \ub178\uc744",
    "singer": "\uc774\ubb38\uc138",
    "tj": "1842",
    "ky": "1482",
    "genre": "ballad",
    "moods": [
      "p",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 82
  },
  {
    "id": "\uc774\ubb38\uc138--\uae4a\uc740-\ubc24\uc744-\ub0a0\uc544\uc11c",
    "title": "\uae4a\uc740 \ubc24\uc744 \ub0a0\uc544\uc11c",
    "singer": "\uc774\ubb38\uc138",
    "tj": "1771",
    "ky": "2259",
    "genre": "ballad",
    "moods": [
      "s",
      "d"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uae40\uad11\uc11d--\ub108\ubb34-\uc544\ud508-\uc0ac\ub791\uc740-\uc0ac\ub791\uc774-\uc544\ub2c8\uc5c8\uc74c\uc744",
    "title": "\ub108\ubb34 \uc544\ud508 \uc0ac\ub791\uc740 \uc0ac\ub791\uc774 \uc544\ub2c8\uc5c8\uc74c\uc744",
    "singer": "\uae40\uad11\uc11d",
    "tj": "13100",
    "ky": "63677",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 70
  },
  {
    "id": "\uc774\ubb38\uc138--\uad11\ud654\ubb38-\uc5f0\uac00",
    "title": "\uad11\ud654\ubb38 \uc5f0\uac00",
    "singer": "\uc774\ubb38\uc138",
    "tj": "1624",
    "ky": "",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uc774\uc120\ud76c--\uadf8\uc911\uc5d0-\uadf8\ub300\ub97c-\ub9cc\ub098",
    "title": "\uadf8\uc911\uc5d0 \uadf8\ub300\ub97c \ub9cc\ub098",
    "singer": "\uc774\uc120\ud76c",
    "tj": "38248",
    "ky": "48415",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 68
  },
  {
    "id": "\uc774\uc6a9--\uc78a\ud600\uc9c4-\uacc4\uc808",
    "title": "\uc78a\ud600\uc9c4 \uacc4\uc808",
    "singer": "\uc774\uc6a9",
    "tj": "512",
    "ky": "659",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc774\uc120\ud76c--\uc778\uc5f0",
    "title": "\uc778\uc5f0",
    "singer": "\uc774\uc120\ud76c",
    "tj": "14814",
    "ky": "45195",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 72
  },
  {
    "id": "\uc804\uc778\uad8c--\uac71\uc815-\ub9d0\uc544\uc694-\uadf8\ub300",
    "title": "\uac71\uc815 \ub9d0\uc544\uc694 \uadf8\ub300",
    "singer": "\uc804\uc778\uad8c",
    "tj": "14251",
    "ky": "45040",
    "genre": "rock",
    "moods": [
      "f",
      "p"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\uc131\uc2dc\uacbd--\ud76c\uc7ac",
    "title": "\ud76c\uc7ac",
    "singer": "\uc131\uc2dc\uacbd",
    "tj": "10842",
    "ky": "9290",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 82
  },
  {
    "id": "\uc131\uc2dc\uacbd--\uac70\ub9ac\uc5d0\uc11c",
    "title": "\uac70\ub9ac\uc5d0\uc11c",
    "singer": "\uc131\uc2dc\uacbd",
    "tj": "16503",
    "ky": "45722",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 70
  },
  {
    "id": "\ubc31\uc9c0\uc601--\ucd1d-\ub9de\uc740-\uac83\ucc98\ub7fc",
    "title": "\ucd1d \ub9de\uc740 \uac83\ucc98\ub7fc",
    "singer": "\ubc31\uc9c0\uc601",
    "tj": "30425",
    "ky": "83914",
    "genre": "ballad",
    "moods": [
      "g",
      "s"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 76
  },
  {
    "id": "\ube45\ub9c8\ub9c8--\uccb4\ub150",
    "title": "\uccb4\ub150",
    "singer": "\ube45\ub9c8\ub9c8",
    "tj": "11019",
    "ky": "63269",
    "genre": "rnb",
    "moods": [
      "g",
      "s"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 78
  },
  {
    "id": "\uae40\ubc94\uc218--\ubcf4\uace0\uc2f6\ub2e4",
    "title": "\ubcf4\uace0\uc2f6\ub2e4",
    "singer": "\uae40\ubc94\uc218",
    "tj": "11095",
    "ky": "62858",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 76
  },
  {
    "id": "\ubc31\uc9c0\uc601--\uc78a\uc9c0-\ub9d0\uc544\uc694",
    "title": "\uc78a\uc9c0 \ub9d0\uc544\uc694",
    "singer": "\ubc31\uc9c0\uc601",
    "tj": "89519",
    "ky": "27830",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 64
  },
  {
    "id": "\ubc31\uc9c0\uc601--\uc0ac\ub791-\uc548-\ud574",
    "title": "\uc0ac\ub791 \uc548 \ud574",
    "singer": "\ubc31\uc9c0\uc601",
    "tj": "15871",
    "ky": "45528",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 72
  },
  {
    "id": "\ubc31\uc9c0\uc601--\uadf8-\uc5ec\uc790",
    "title": "\uadf8 \uc5ec\uc790",
    "singer": "\ubc31\uc9c0\uc601",
    "tj": "33282",
    "ky": "76732",
    "genre": "ballad",
    "moods": [
      "s",
      "g"
    ],
    "era": 2000,
    "vocal": 4,
    "heat": 68
  },
  {
    "id": "\ube0c\ub77c\uc6b4-\uc544\uc774\uc988--\ubc8c\uc368-\uc77c\ub144",
    "title": "\ubc8c\uc368 \uc77c\ub144",
    "singer": "\ube0c\ub77c\uc6b4 \uc544\uc774\uc988",
    "tj": "9551",
    "ky": "6923",
    "genre": "rnb",
    "moods": [
      "s",
      "d"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 74
  },
  {
    "id": "\uc774\uc2b9\uae30--\ub0b4-\uc5ec\uc790\ub77c\ub2c8\uae4c",
    "title": "\ub0b4 \uc5ec\uc790\ub77c\ub2c8\uae4c",
    "singer": "\uc774\uc2b9\uae30",
    "tj": "13483",
    "ky": "9854",
    "genre": "ballad",
    "moods": [
      "d",
      "s"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 68
  },
  {
    "id": "\uc870\uc6a9\ud544--\uc5ec\ud589\uc744-\ub5a0\ub098\uc694",
    "title": "\uc5ec\ud589\uc744 \ub5a0\ub098\uc694",
    "singer": "\uc870\uc6a9\ud544",
    "tj": "2056",
    "ky": "3493",
    "genre": "rock",
    "moods": [
      "p",
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\ube0c\ub77c\uc6b4-\uc544\uc774\uc988--\uac00\uc9c0\ub9c8-\uac00\uc9c0\ub9c8",
    "title": "\uac00\uc9c0\ub9c8 \uac00\uc9c0\ub9c8",
    "singer": "\ube0c\ub77c\uc6b4 \uc544\uc774\uc988",
    "tj": "19762",
    "ky": "46333",
    "genre": "rnb",
    "moods": [
      "g",
      "s"
    ],
    "era": 2000,
    "vocal": 5,
    "heat": 66
  },
  {
    "id": "\uc774\uc2b9\uae30--\uc0ad\uc81c",
    "title": "\uc0ad\uc81c",
    "singer": "\uc774\uc2b9\uae30",
    "tj": "13588",
    "ky": "68473",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 64
  },
  {
    "id": "\uc870\uc6a9\ud544--\ub2e8\ubc1c\uba38\ub9ac",
    "title": "\ub2e8\ubc1c\uba38\ub9ac",
    "singer": "\uc870\uc6a9\ud544",
    "tj": "635",
    "ky": "1461",
    "genre": "rock",
    "moods": [
      "p",
      "f"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc870\uc6a9\ud544--\uadf8-\uaca8\uc6b8\uc758-\ucc3b\uc9d1",
    "title": "\uadf8 \uaca8\uc6b8\uc758 \ucc3b\uc9d1",
    "singer": "\uc870\uc6a9\ud544",
    "tj": "1481",
    "ky": "1454",
    "genre": "ballad",
    "moods": [
      "s",
      "p"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 66
  },
  {
    "id": "\uc870\ub355\ubc30--\ub098\uc758-\uc61b\ub0a0\uc774\uc57c\uae30",
    "title": "\ub098\uc758 \uc61b\ub0a0\uc774\uc57c\uae30",
    "singer": "\uc870\ub355\ubc30",
    "tj": "1728",
    "ky": "1492",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 60
  },
  {
    "id": "\uc870\ub355\ubc30--\uafc8\uc5d0",
    "title": "\uafc8\uc5d0",
    "singer": "\uc870\ub355\ubc30",
    "tj": "1515",
    "ky": "2278",
    "genre": "ballad",
    "moods": [
      "s"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 58
  },
  {
    "id": "\uc7a5\uc724\uc815--\uc5b4\uba38\ub098",
    "title": "\uc5b4\uba38\ub098",
    "singer": "\uc7a5\uc724\uc815",
    "tj": "12667",
    "ky": "9647",
    "genre": "trot",
    "moods": [
      "p",
      "h"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 80
  },
  {
    "id": "\ud64d\uc9c4\uc601--\uc0ac\ub791\uc758-\ubc30\ud130\ub9ac",
    "title": "\uc0ac\ub791\uc758 \ubc30\ud130\ub9ac",
    "singer": "\ud64d\uc9c4\uc601",
    "tj": "31308",
    "ky": "46697",
    "genre": "trot",
    "moods": [
      "p",
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "\uc7a5\uc724\uc815--\ucd08\ud63c",
    "title": "\ucd08\ud63c",
    "singer": "\uc7a5\uc724\uc815",
    "tj": "33791",
    "ky": "76588",
    "genre": "trot",
    "moods": [
      "p",
      "g"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 68
  },
  {
    "id": "\uc601\ud0c1--\ucc10\uc774\uc57c",
    "title": "\ucc10\uc774\uc57c",
    "singer": "\uc601\ud0c1",
    "tj": "89168",
    "ky": "21625",
    "genre": "trot",
    "moods": [
      "p",
      "h"
    ],
    "era": 2020,
    "vocal": 2,
    "heat": 74
  },
  {
    "id": "\uc9c4\uc131--\uc548\ub3d9\uc5ed\uc5d0\uc11c",
    "title": "\uc548\ub3d9\uc5ed\uc5d0\uc11c",
    "singer": "\uc9c4\uc131",
    "tj": "37195",
    "ky": "87706",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 68
  },
  {
    "id": "\uae40\uc5f0\uc790--\uc544\ubaa8\ub974-\ud30c\ud2f0",
    "title": "\uc544\ubaa8\ub974 \ud30c\ud2f0",
    "singer": "\uae40\uc5f0\uc790",
    "tj": "37173",
    "ky": "48176",
    "genre": "trot",
    "moods": [
      "p",
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 72
  },
  {
    "id": "\uc1a1\uac00\uc778--\ubb34\uba85\ubc30\uc6b0",
    "title": "\ubb34\uba85\ubc30\uc6b0",
    "singer": "\uc1a1\uac00\uc778",
    "tj": "53927",
    "ky": "97943",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uae40\uc218\ud76c--\ub0a8\ud589\uc5f4\ucc28",
    "title": "\ub0a8\ud589\uc5f4\ucc28",
    "singer": "\uae40\uc218\ud76c",
    "tj": "911",
    "ky": "1367",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "\uae40\ucd94\uc790--\ub2d8\uc740-\uba3c-\uacf3\uc5d0",
    "title": "\ub2d8\uc740 \uba3c \uacf3\uc5d0",
    "singer": "\uae40\ucd94\uc790",
    "tj": "76300",
    "ky": "",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 56
  },
  {
    "id": "\ub098\ud6c8\uc544--\uace0\ud5a5\uc5ed",
    "title": "\uace0\ud5a5\uc5ed",
    "singer": "\ub098\ud6c8\uc544",
    "tj": "",
    "ky": "135",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 8090,
    "vocal": 2,
    "heat": 54
  },
  {
    "id": "\ub0a8\uc9c4--\ub2f9\uc2e0\uc774-\uc88b\uc544",
    "title": "\ub2f9\uc2e0\uc774 \uc88b\uc544",
    "singer": "\ub0a8\uc9c4",
    "tj": "30945",
    "ky": "46604",
    "genre": "trot",
    "moods": [
      "p"
    ],
    "era": 8090,
    "vocal": 2,
    "heat": 50
  },
  {
    "id": "\uae40\uc885\uc11c--\uc544\ub984\ub2e4\uc6b4-\uad6c\uc18d",
    "title": "\uc544\ub984\ub2e4\uc6b4 \uad6c\uc18d",
    "singer": "\uae40\uc885\uc11c",
    "tj": "3611",
    "ky": "4906",
    "genre": "rock",
    "moods": [
      "s",
      "g"
    ],
    "era": 8090,
    "vocal": 4,
    "heat": 52
  },
  {
    "id": "the-beatles--hey-jude",
    "title": "Hey Jude",
    "singer": "The Beatles",
    "tj": "7018",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "p",
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 62
  },
  {
    "id": "abba--dancing-queen",
    "title": "Dancing Queen",
    "singer": "ABBA",
    "tj": "7166",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "p",
      "h"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 64
  },
  {
    "id": "queen--bohemian-rhapsody",
    "title": "Bohemian Rhapsody",
    "singer": "Queen",
    "tj": "7745",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "g",
      "h"
    ],
    "era": 8090,
    "vocal": 5,
    "heat": 78
  },
  {
    "id": "john-lennon--imagine",
    "title": "Imagine",
    "singer": "John Lennon",
    "tj": "7267",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "s",
      "p"
    ],
    "era": 8090,
    "vocal": 3,
    "heat": 60
  },
  {
    "id": "adele--someone-like-you",
    "title": "Someone Like You",
    "singer": "Adele",
    "tj": "22204",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "s",
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 74
  },
  {
    "id": "adele--rolling-in-the-deep",
    "title": "Rolling in the Deep",
    "singer": "Adele",
    "tj": "22213",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "g",
      "h"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 70
  },
  {
    "id": "ed-sheeran--shape-of-you",
    "title": "Shape of You",
    "singer": "Ed Sheeran",
    "tj": "22966",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "f",
      "h"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 78
  },
  {
    "id": "bruno-mars--just-the-way-you-are",
    "title": "Just the Way You Are",
    "singer": "Bruno Mars",
    "tj": "22134",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "d"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 66
  },
  {
    "id": "maroon-5--sunday-morning",
    "title": "Sunday Morning",
    "singer": "Maroon 5",
    "tj": "21232",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "d",
      "f"
    ],
    "era": 2000,
    "vocal": 3,
    "heat": 58
  },
  {
    "id": "whitney-houston--i-will-always-love-you",
    "title": "I Will Always Love You",
    "singer": "Whitney Houston",
    "tj": "7107",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "g",
      "p"
    ],
    "era": 8090,
    "vocal": 5,
    "heat": 70
  },
  {
    "id": "hozier--take-me-to-church",
    "title": "Take Me to Church",
    "singer": "Hozier",
    "tj": "22718",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "g"
    ],
    "era": 2010,
    "vocal": 4,
    "heat": 56
  },
  {
    "id": "celine-dion--my-heart-will-go-on",
    "title": "My Heart Will Go On",
    "singer": "Celine Dion",
    "tj": "7736",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "g"
    ],
    "era": 8090,
    "vocal": 5,
    "heat": 68
  },
  {
    "id": "john-legend--all-of-me",
    "title": "All of Me",
    "singer": "John Legend",
    "tj": "22512",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "d",
      "s"
    ],
    "era": 2010,
    "vocal": 3,
    "heat": 58
  },
  {
    "id": "tate-mcrae--greedy",
    "title": "greedy",
    "singer": "Tate McRae",
    "tj": "79348",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 54
  },
  {
    "id": "miley-cyrus--flowers",
    "title": "Flowers",
    "singer": "Miley Cyrus",
    "tj": "79096",
    "ky": "",
    "genre": "oldpop",
    "moods": [
      "h",
      "f"
    ],
    "era": 2020,
    "vocal": 3,
    "heat": 56
  }
];

export const SONG_BY_ID: Record<string, Song> = Object.fromEntries(SONGS.map((s) => [s.id, s]));
