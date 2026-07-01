import { ListPagination, type ListPaginationProps } from '@/components/shared/ListPagination'

export type AdminListPaginationProps = Omit<ListPaginationProps, 'variant'>

export function AdminListPagination(props: AdminListPaginationProps) {
  return <ListPagination {...props} variant="admin" />
}
