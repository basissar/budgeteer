import { Category } from '../src/model/Category.ts';

export async function up(){
    for (let id = 1; id <= 11; id++) {
        await Category.update(
        {
            iconId: id
        }, {
            where: {id: id}
        });
    }
}

export async function down() {
    for (let id = 1; id <= 11; id++) {
        await Category.update(
        {
            iconId: null
        }, {
            where: {id: id}
        });
    }
};