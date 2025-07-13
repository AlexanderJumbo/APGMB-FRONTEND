export interface LectureResponse {
    idLecture: number;
    dateLecture: string; // ISO 8601 format
    currentLecture: number;
    prevLecture: number;
    observation: string;
    accountId: number;
    accountUser: string;
    accountMeter: string;
    operatorName: string;
    totalConsumption: number;   // nuevo campo
    nameSector: string;         // nuevo campo
}

export interface UpdateLectureRequest {
    idLecture: number;
    currentLecture: number;
}
