import { Sequelize } from "npm:sequelize-typescript";
import { Account } from "../../src/model/Account.ts";
import { Avatar } from "../../src/model/Avatar.ts";
import { Item } from "../../src/model/Item.ts";
import { ItemEquipped } from "../../src/model/ItemEquipped.ts";
import { ItemOwned } from "../../src/model/ItemOwned.ts";
import { User } from "../../src/model/User.ts";
import pg from 'npm:pg';
import { assert } from "https://deno.land/std@0.200.0/assert/assert.ts";
import { Wallet } from "../../src/model/Wallet.ts";
import { Expense } from "../../src/model/Expense.ts";
import { Budget } from "../../src/model/Budget.ts";
import { Goal } from "../../src/model/Goal.ts";
import { Category } from "../../src/model/Category.ts";
import { ItemAvatar } from "../../src/model/ItemAvatar.ts";

const sequelize = new Sequelize({
    database: 'postgres', 
    username: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    dialectModule: pg,
    models: [Account, User, Wallet, Expense, Budget, Goal, Category, Avatar, Item, ItemOwned, ItemEquipped, ItemAvatar],
  });
  
  async function findByUser(id: string): Promise<Account | null> {
    return await Account.findOne({
      where: {
        userId: id,
      },
      include: [
        {
          model: Avatar,
          as: 'avatar',
        },
        {
          model: Item,
          as: 'ownedItems',
          through: { attributes: [] }
        },
        {
          model: Item,
          as: 'equippedItems',
          through: { attributes: [] }
        }
      ]
    });
  }
  
  Deno.test("findByUser should return account with associated models", async (t) => {
    await sequelize.sync({ force: true });
  
    const user = await User.create({ username: "test username", timezone: 'Europe/Prague'});
    const avatar = await Avatar.create({ name: 'Test Avatar', description: 'Description' });
    const item1 = await Item.create({ name: 'Sword', price: 100, rarity: 'common', avatarId: avatar.id });
    const item2 = await Item.create({ name: 'Shield', price: 150, rarity: 'rare', avatarId: avatar.id });
  
    const account = await Account.create({
      userId: user.id,
      avatarId: avatar.id,
      experience: 0,
      credits: 100,
      level: 1,
    });
  
    await account.$add('ownedItems', item1);
    await account.$add('equippedItems', item2);
  
    const foundAccount = await findByUser(user.id);
  
    assert(foundAccount?.userId == user.id);
    assert(foundAccount?.avatar.id == avatar.id);
    assert(foundAccount?.ownedItems.length == 1);
    assert(foundAccount?.ownedItems[0].name == 'Sword');
    assert(foundAccount?.equippedItems.length == 1);
    assert(foundAccount?.equippedItems[0].name == 'Shield');

    for (const item of foundAccount?.ownedItems) {
        console.log(item);
    }

    for (const item of foundAccount.equippedItems){
        console.log(item);
    }

    await t.step("Database cleanup", async () => {
        await sequelize.drop();
        await sequelize.close();
    })
  });
  