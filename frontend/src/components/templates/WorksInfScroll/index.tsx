import { Box } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import { useVirtualizer } from '@tanstack/react-virtual'
import React from 'react'
import { WorkImageCard } from '~/components/parts/WorkImageCard'
import { useInfiniteScroll } from '~/utils/hook/useInfiniteScroll';
import { WorkPagination } from '~/models/types'

type Props = {
  pageInfo: WorkPagination["pageInfo"]
  works: WorkPagination["nodes"]
  onScroll: () => void
}

const WorksInfScroll: React.FC<Props> = ({ pageInfo, works, onScroll }): JSX.Element => {
  const parentRef = React.useRef<Element>(null)

  const rowVirtualizer = useVirtualizer({
    count: pageInfo.hasNextPage ? works.length + 1 : works.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 12,
  })

  const isLoading = useInfiniteScroll(onScroll)

  return (
    <Box component='main' sx={{ m: 2 }} ref={parentRef}>
      <Grid
        container
        spacing={2}
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > works.length - 1
          const post = works[virtualRow.index]
          return (
            <Grid item key={'works:' + virtualRow.index} xs={6} md={4} lg={3}>
              {isLoaderRow ? <CircularProgress key={virtualRow.index} /> : <WorkImageCard work={post} />}
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default WorksInfScroll
