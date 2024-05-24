import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts";

class XPLevelCalculator {
    private BASE_XP = 50;
    private XP_INCREASE_PERCENTAGE = 0.1;

    calculateXPForLevel(level: number): number {
        if (level === 1) return this.BASE_XP;
        return Math.floor(this.BASE_XP * Math.pow(1 + this.XP_INCREASE_PERCENTAGE, level - 1));
    }

    calculateLevelForXP(xp: number): number {
        let level = 1;
        let cumulativeXP = this.BASE_XP;
        while (xp >= cumulativeXP) {
            level++;
            cumulativeXP += this.calculateXPForLevel(level);
        }
        return level - 1; // return previous level
    }

    totalXPForLevel(targetLevel: number): number {
        let totalXP = 0;
        for (let level = 1; level <= targetLevel; level++) {
            totalXP += this.calculateXPForLevel(level);
        }
        return totalXP;
    }
}

Deno.test("calculateXPForLevel: should calculate correct XP for level 1", () => {
    const xpCalc = new XPLevelCalculator();
    const level = 1;
    const expectedXP = 50; // BASE_XP
    const actualXP = xpCalc.calculateXPForLevel(level);
    assertEquals(actualXP, expectedXP);
});

Deno.test("calculateXPForLevel: should calculate correct XP for level 2", () => {
    const xpCalc = new XPLevelCalculator();
    const level = 2;
    const expectedXP = Math.floor(50 * 1.1); // BASE_XP * (1 + XP_INCREASE_PERCENTAGE)
    const actualXP = xpCalc.calculateXPForLevel(level);
    assertEquals(actualXP, expectedXP);
});

Deno.test("calculateLevelForXP: should calculate correct level for 0 XP", () => {
    const xpCalc = new XPLevelCalculator();
    const xp = 0;
    const expectedLevel = 0;
    const actualLevel = xpCalc.calculateLevelForXP(xp);
    assertEquals(actualLevel, expectedLevel);
});

Deno.test("calculateLevelForXP: should calculate correct level for 50 XP", () => {
    const xpCalc = new XPLevelCalculator();
    const xp = 50;
    const expectedLevel = 1;
    const actualLevel = xpCalc.calculateLevelForXP(xp);
    assertEquals(actualLevel, expectedLevel);
});

Deno.test("calculateLevelForXP: should calculate correct level for 105 XP", () => {
    const xpCalc = new XPLevelCalculator();
    const xp = 105; // 50 (level 1) + 55 (level 2)
    const expectedLevel = 2;
    const actualLevel = xpCalc.calculateLevelForXP(xp);
    assertEquals(actualLevel, expectedLevel);
});

Deno.test("totalXPForLevel: should calculate correct total XP for level 1", () => {
    const xpCalc = new XPLevelCalculator();
    const targetLevel = 1;
    const expectedTotalXP = 50; // BASE_XP
    const actualTotalXP = xpCalc.totalXPForLevel(targetLevel);
    assertEquals(actualTotalXP, expectedTotalXP);
});

Deno.test("totalXPForLevel: should calculate correct total XP for level 2", () => {
    const xpCalc = new XPLevelCalculator();
    const targetLevel = 2;
    const expectedTotalXP = 50 + Math.floor(50 * 1.1); // BASE_XP + (BASE_XP * (1 + XP_INCREASE_PERCENTAGE))
    const actualTotalXP = xpCalc.totalXPForLevel(targetLevel);
    assertEquals(actualTotalXP, expectedTotalXP);
});

Deno.test("totalXPForLevel: should calculate correct total XP for level 3", () => {
    const xpCalc = new XPLevelCalculator();
    const targetLevel = 3;
    const expectedTotalXP = 50 + Math.floor(50 * 1.1) + Math.floor(50 * Math.pow(1.1, 2)); // BASE_XP + (BASE_XP * (1 + XP_INCREASE_PERCENTAGE)) + (BASE_XP * (1 + XP_INCREASE_PERCENTAGE)^2)
    const actualTotalXP = xpCalc.totalXPForLevel(targetLevel);
    assertEquals(actualTotalXP, expectedTotalXP);
});
