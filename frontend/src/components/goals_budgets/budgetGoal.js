import React from 'react';
import Budgets from './budgets';
import Goals from './goals';

export default function BudgetGoalOverview() {
    return (
            <div className='gap-10 mx-auto flex flex-col items-center'>
                <Budgets/>
                <div className='mb-20'>
                    <Goals/>
                </div>
                
            </div>
    );
}
