import HttpCodes from "http-status-codes";

export class SharedErrors {

    //HTTP ERRORS
    static get InternalServerError(){
        return {
            code: HttpCodes.INTERNAL_SERVER_ERROR,
            message: 'InternalServerError'
        }
    }


    //COMMON ERRORS
    static get UserNotFound(){
        return {
            code: HttpCodes.NOT_FOUND,
            message: 'User Not Found'
        };
    }

    static get PresenceNotFound(){
        return {
            code: HttpCodes.NOT_FOUND,
            message: 'Presence Not Found'
        };
    }

    static get AccessDenied(){
        return {
            code: HttpCodes.UNAUTHORIZED,
            message: 'Access Denied'
        }
    }

    static get InvalidToken(){
        return {
            code: HttpCodes.BAD_REQUEST,
            message: 'Invalid Token'
        }
    }
}