import { Box, Button, Group, Paper } from '@mantine/core'
import { bindActionCreators } from '@reduxjs/toolkit'
import { dracula } from '@uiw/codemirror-theme-dracula'
import CodeMirror from '@uiw/react-codemirror'
import _ from 'lodash'
import React, { FC, useEffect } from 'react'
import { useTagEditor } from '../useTagEditor'
import { useDebouncedState } from '@mantine/hooks'
const useHook = () => {
  const { dispatch, myActions, myState, currTagList } = useTagEditor()
  const { blockID, code } = myState
  const actionCreators = bindActionCreators({ ...myActions }, dispatch)
  // when block changed , update code state
  useEffect(() => {
    const tagText = _.map(currTagList, 'title').join(`,\n`)
    console.info(' watchThis tagText', tagText)
    if (_.isEmpty(tagText)) return
    actionCreators.setState({ code: tagText })
  }, [blockID])
  return { blockID, code, ...actionCreators }
}
export const BlockCodeMirror: FC = () => {
  return (
    <Box className='mh-100vh h-100vh'>
      <Box>
        <Box mb='md'>
          <ControlPanel />
        </Box>
        <CodePanel />
      </Box>
    </Box>
  )
}
const CodePanel: FC = () => {
  const { setState, code } = useHook()
  const [debCode, setDebCode] = useDebouncedState(code, 200)
  useEffect(() => {
    setState({ code: debCode })
  }, [debCode])
  const defaultText = `(masterpiece:1.2),((ultra-detail)),[1Girl]...`
  const maxHeight = 'calc(100vh - 24px)'
  return <CodeMirror value={debCode} placeholder={defaultText} maxHeight={maxHeight} onChange={setDebCode} theme={dracula} />
}
const ControlPanel: FC = () => {
  const { setState, code, submitCode } = useHook()
  const handleSplitClick = () => {
    const nextCode = _.replace(code, /,/g, ',\n')
    setState({ code: nextCode })
  }
  const handleUnderScoreClick = () => {
    const nextCode = _.replace(code, /[^\S\n]/g, '_')
    setState({ code: nextCode })
  }
  const handleTrimClick = () => {
    const nextCode = _.replace(code, /\s\s/g, ` `)
    setState({ code: nextCode })
  }
  const handleRefreshClick = () => {
    submitCode({ code })
  }
  return (
    <Paper radius='xl' p='sm'>
      <Group>
        <Button variant='filled' w='6rem' radius='xl' color='gray' onClick={handleSplitClick}>
          Split
        </Button>
        <Button variant='filled' w='6rem' radius='xl' color='gray' onClick={handleTrimClick}>
          Trim
        </Button>
        <Button variant='filled' w='6rem' radius='xl' color='gray' onClick={handleUnderScoreClick}>
          ToUL
        </Button>
        <Button ml='auto' variant='filled' w='6rem' radius='xl' color='yellow' onClick={handleRefreshClick}>
          Refresh
        </Button>
      </Group>
    </Paper>
  )
}
