export interface APISuccessResponseInterface {
    data: any;
    message: string;
    statusCode: number;
    success: boolean;
}


export interface Pitch {
    id: Number,
    name: string,
    location: string,
    price_per_hour: string
        
}