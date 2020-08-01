import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import lodash from 'lodash'

import { AppState } from '@/store/ducks/types'
import { Creators } from '@/store/ducks/users'
import { UserGetQuery, User, CreateUser } from '@/types'
import Pagination from '@material-ui/lab/Pagination'

import { HomeHeader } from './components/header'
import { ConfirmModal } from './components/modals/confirm-modal'
import { CreateUserModal } from './components/modals/create-user-modal'
import { TableHeader, Sort } from './components/table-header'
import { TableRow } from './components/table-row'
import { Container, Table, TableRows, PaginationContainer } from './styles'

interface RowCheck {
  [id: string]: boolean
}

export const Home: React.FC = () => {
  const dispatch = useDispatch()
  const users = useSelector((state: AppState) => state.User.pagination.items)
  const pagination = useSelector((state: AppState) => state.User.pagination)
  const loadings = useSelector((state: AppState) => state.User.loadings)
  const confirmModalIsOpen = useSelector(
    (state: AppState) => state.User.confirmModalIsOpen,
  )
  const createModalIsOpen = useSelector(
    (state: AppState) => state.User.createModalIsOpen,
  )

  const [checked, setChecked] = useState<boolean>(false)
  const [rowChecked, setRowChecked] = useState<RowCheck>({})
  const [selectedUser, setSelectedUser] = useState<User>()
  const [modalTitle, setModalTitle] = useState<string>('Adicionar novo usuario')
  const [query, setQuery] = useState<UserGetQuery>({
    limit: 10,
    page: 1,
  })

  const handleDeleteSelected = () => {
    setModalTitle('Deseja realmente deletar todos selecionados?')
    dispatch(Creators.setConfirmModalState(true))
  }

  const handleAdd = () => {
    dispatch(Creators.setCreateModalState(true))
  }

  const handleSort = (field: string, direction: Sort) => {
    console.log({ field, direction })
  }

  const handleConfirmDelete = (user: User) => {
    setModalTitle(`Deseja realmente deletar o usuario ${user.email}?`)
    setSelectedUser(user)
    dispatch(Creators.setConfirmModalState(true))
  }
  const handleEditUser = (user: User) => {}

  const handleCheckAll = (isChecked: boolean) => {
    setChecked(isChecked)
    setRowChecked(lodash.mapValues(rowChecked, () => isChecked))
  }

  const handleCheckRow = (checked: boolean, id: string) => {
    setRowChecked({ ...rowChecked, [id]: checked })
    setChecked(false)
  }

  useEffect(() => {
    dispatch(Creators.requestUsers(query))
  }, [dispatch, query])

  useEffect(() => {
    const usersChecked = {}
    users?.forEach(user => Object.assign(usersChecked, { [user._id]: false }))
    setRowChecked(usersChecked)
  }, [users])

  const handleModalClose = () => {
    dispatch(Creators.setConfirmModalState(false))
  }

  const handleConfirmModal = () => {
    if (selectedUser) dispatch(Creators.deleteUser(selectedUser?._id))
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    if (page === query.page) return false
    return setQuery({ ...query, page })
  }

  const handleCreateUser = (user: CreateUser) => {
    dispatch(
      Creators.createUser({ ...user, age: parseInt(user.age as string, 10) }),
    )
  }

  const handleModalCreateClose = () => {
    dispatch(Creators.setCreateModalState(false))
  }

  return (
    <Container>
      {confirmModalIsOpen && (
        <ConfirmModal
          onClose={handleModalClose}
          title={modalTitle}
          onConfirm={handleConfirmModal}
          loading={loadings.delete}
        />
      )}

      {createModalIsOpen && (
        <CreateUserModal
          onClose={handleModalCreateClose}
          title="Adicionar novo usuario"
          onConfirm={handleCreateUser}
          loading={loadings.post}
        />
      )}

      <HomeHeader onClick={handleAdd} handleDelete={handleDeleteSelected} />
      <Table>
        <TableHeader
          onSort={handleSort}
          checked={checked}
          handleCheck={handleCheckAll}
        />
        <TableRows>
          {users?.map((user, index) => (
            <TableRow
              key={index}
              user={user}
              checked={rowChecked[user._id]}
              handleCheck={handleCheckRow}
              onDelete={handleConfirmDelete}
              onEdit={handleEditUser}
            />
          ))}
        </TableRows>
      </Table>
      <PaginationContainer>
        <Pagination
          count={pagination.meta.total_pages}
          page={pagination.meta.current_page}
          onChange={handlePageChange}
        />
      </PaginationContainer>
    </Container>
  )
}
