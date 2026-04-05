/** Zebra striping for admin data tables */
export function adminZebraRowClass(index: number): string {
  return index % 2 === 1 ? 'bg-[#F3F7FC]' : 'bg-white'
}
