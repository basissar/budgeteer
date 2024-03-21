import {RouterContext} from 'https://deno.land/x/oak@v12.6.1/router.ts';
import { key } from "../utils/apiKey.ts";
import { create, getNumericDate, verify } from "https://deno.land/x/djwt@v2.4/mod.ts";

const authorization = async (ctx: RouterContext<string>, next: () => Promise<any>) => {
    try {
        const token = ctx.request.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            ctx.response.status = 401;
            ctx.response.body = { message: 'Authorization token missing' };
            return;
        }
    
        const result = await verify(token, key);
    
        if (!result) {
            ctx.response.status = 401;
            ctx.response.body = { message: 'Invalid token or expired' };
            return;
        }
    
        const tokenId = (result as { payload: { id: number } }).payload.id;
    
        const paramsId = ctx.params.userId;
    
        if(tokenId != Number(paramsId)) {
            ctx.response.status = 403;
            ctx.response.body = { message: 'You are not authorized to perform this action' };
            return;
        }
    
        await next();
    } catch (err) {
        ctx.response.status = 401;
        ctx.response.body = { message: 'Authorization failed due to an error: ' + err.message };
    }
    
}

export default authorization;