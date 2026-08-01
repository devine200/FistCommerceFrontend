/**
 * Flat tenor quote math — run with:
 *   npx --yes tsx src/utils/loanTierCalculations.selftest.ts
 */
import { calculateLoanTierFigures } from './loanTierCalculations'

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg)
}

const figures = calculateLoanTierFigures(1000, {
  duration_days: 90,
  interest_percent: 10,
})
assert(figures, 'expected figures')
assert(Math.abs(figures.interest - 100) < 1e-9, `interest=${figures.interest} want 100`)
assert(Math.abs(figures.repayment - 1100) < 1e-9, `repayment=${figures.repayment} want 1100`)

const thirty = calculateLoanTierFigures(10_000, {
  duration_days: 30,
  interest_percent: 30,
})
assert(thirty, 'expected 30% figures')
assert(Math.abs(thirty.interest - 3000) < 1e-9, `interest=${thirty.interest} want 3000`)
assert(Math.abs(thirty.repayment - 13_000) < 1e-9, `repayment=${thirty.repayment} want 13000`)

console.log('loanTierCalculations.selftest: ok')
