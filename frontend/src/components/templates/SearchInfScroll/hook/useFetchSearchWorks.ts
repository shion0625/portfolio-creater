import useQuerySearch, { Variables, SearchDataState } from './useQuerySearch'
import { useState, useCallback, useRef } from 'react'
import { Work, User, Model, SortBy, Node } from '~/models/types'
import { useDidUpdateEffect } from '~/utils/hook/useDidUpdateEffect'

// targetによって、返されるsearchDataの型を切り替える
type SearchNodeDataState<T extends Model> = T extends Model.Work ? Work : User

type UseFetchSearchWorks<T extends Model> = {
  searchData: SearchDataState<T>
  onScroll: () => void
}

const DEFAULT_VOLUMES: number = Number(process.env.NEXT_PUBLIC_DEFAULT_VOLUMES)
const CURRENT_TIME: string = new Date().toISOString()
// 初期のsearchData
const INITIAL_STATE = {
  pageInfo: {
    count: 0,
    hasNextPage: true,
    hasPreviousPage: false,
    page: 0,
    paginationLength: 0,
    totalCount: 0,
  },
  nodes: [],
}
// 初期のvariables
const INITIAL_VARIABLES = {
  keyword: '',
  target: '',
  searchedAt: '',
  sortBy: '',
  num: 9999,
  limit: DEFAULT_VOLUMES,
};

export const useFetchSearchWorks = <T extends Model>(
  target: T,
  sortBy: SortBy,
  keyword: string,
): UseFetchSearchWorks<T> => {
  // searchDataのstate
  const [searchData, setSearchData] = useState<SearchDataState<T>>(() => ({
    type: target,
    ...INITIAL_STATE,
  }))

  // variablesのstate
  const [variables, setVariable] = useState<Variables<T>>({
    ...INITIAL_VARIABLES,
    target,
    sortBy,
    keyword,
    searchedAt: CURRENT_TIME,
  })
  //カーソルスクロール使用するための最後のデータ
  const lastDataRef = useRef<Node | undefined>(undefined)

  const { refetch } = useQuerySearch(variables, setSearchData, lastDataRef)

  // keywordが変更されたら、searchDataを初期化してvariablesを更新
  useDidUpdateEffect(() => {
    setSearchData((prev) => ({
      ...prev,
      ...INITIAL_STATE,
    }))
    //variableを初期値に変更
    setVariable((prev) => ({
      ...prev,
      keyword,
      searchedAt: CURRENT_TIME,
      num: 9999,
    }))
  }, [keyword])

  // variablesが変更されたら、refetchが発火する
  useDidUpdateEffect(() => {
    refetch(variables)
  }, [variables, refetch])

  // lastDataRef.currentをvariablesに反映
  const onScroll = useCallback((): void => {
    const lastData = lastDataRef.current as SearchNodeDataState<T>
    if (lastData) {
      setVariable((prev) => ({
        ...prev,
        searchedAt: lastData.created_at,
        num: lastData.serial_number,
      }))
    }
  }, [])

  return {
    searchData: searchData,
    onScroll,
  }
}
