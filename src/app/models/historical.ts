export interface LectureHistoryItem {
    idLecture: number;
    dateLecture: string;
    currentLecture: number;
    prevLecture: number;
    observation: string;
    accountId: number;
    accountUser: string;
    accountMeter: string;
    operatorName: string;
    totalConsumption: number
    nameSector: string;
}

export interface LectureHistoryResponse {
    content: LectureHistoryItem[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

export interface LectureHistoryQueryParams {
    f: string;
    d: 'asc' | 'desc';
    n: number;
    p: number;
    startDate: string;
    endDate: string;
    user?: string;
}