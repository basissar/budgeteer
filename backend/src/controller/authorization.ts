import {RouterContext} from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { key } from "../utils/apiKey.ts";
import { verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { FORBIDDEN, UNAUTHORIZED } from '../config/macros.ts';

const authorization = async (ctx: RouterContext<string>, next: () => Promise<any>) => {
    try {

        //todo redo it with httponly cookie
        const token = ctx.request.headers.get('Authorization')?.split(' ')[1];

        // const token = await ctx.cookies.get('token');

        if (!token) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: 'Authorization token missing' };
            return;
        }
    
        const result = await verify(token, key);
    
        if (!result) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: 'Invalid token or expired' };
            return;
        }
    
        const tokenId = (result as { payload: { id: string } }).payload.id;
    
        const paramsId = ctx.params.userId;

        if (paramsId != null || paramsId != undefined){
            if (Object.keys(paramsId).length !== 0) {

                if(tokenId != paramsId) {
                    ctx.response.status = FORBIDDEN;
                    ctx.response.body = { message: 'You are not authorized to perform this action' };
                    return;
                }
            }
        }

        await next();
    } catch (err) {
        ctx.response.status = UNAUTHORIZED;
        ctx.response.body = { message: 'Authorization failed due to an error: ' + err.message };
    }
    
}

export default authorization;