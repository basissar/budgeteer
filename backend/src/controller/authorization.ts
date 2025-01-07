import { RouterContext } from "@oak/oak";
import { key } from "../utils/apiKey.ts";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { FORBIDDEN, UNAUTHORIZED } from '../config/macros.ts';

export class AuthorizationMiddleware {
    async handle(ctx: RouterContext<string>, next: () => Promise<any>) {

        const token = await ctx.cookies.get("jwt_token");

        if (!token) {
            ctx.response.status = UNAUTHORIZED;
            ctx.response.body = { message: 'Authorization token missing' };
            return;
        }

        try {
            const result = await verify(token, key);

            if (!result) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: 'Invalid token or expired' };
                return;
            }

            const tokenId = (result as { payload: { id: string } }).payload.id;

            const paramsId = ctx.params.userId;

            if (paramsId != null && paramsId !== undefined) {
                if (Object.keys(paramsId).length !== 0) {

                    if (tokenId !== paramsId) {
                        ctx.response.status = FORBIDDEN;
                        ctx.response.body = { message: 'You are not authorized to perform this action' };
                        return;
                    }
                }
            }

            await next();
        } catch (e) {
            if ((e as Error).message.includes("signature does not match")) {
                ctx.response.status = UNAUTHORIZED;
                ctx.response.body = { message: "Invalid token signature" };
            } else {
                ctx.response.status = 500;
                ctx.response.body = { message: `${e}` };
            }
        }
    }
}
