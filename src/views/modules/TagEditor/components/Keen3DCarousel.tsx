import { SFIcon } from '@/views/shared/SFIcon'
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { ActionIcon, Box } from '@mantine/core'
import { KeenSliderPlugin, useKeenSlider } from 'keen-slider/react'
import _ from 'lodash'
import React, { FC, ReactNode, useEffect, useState } from 'react'
import { useTagEditor } from '../useTagEditor'
import { bindActionCreators } from '@reduxjs/toolkit'

const MutationPlugin: KeenSliderPlugin = (slider) => {
  const config = { childList: true }

  const observer = new MutationObserver(function (mutations) {
    _.forEach(mutations, () => slider.update())
  })
  slider.on('created', () => {
    observer.observe(slider.container, config)
  })
  slider.on('destroyed', () => {
    observer.disconnect()
  })
}

const carouselPlugin: KeenSliderPlugin = (slider) => {
  slider.on('detailsChanged', detailsChanged)
  function detailsChanged(): void {
    const slideCount = slider.slides.length

    const z = slideCount * 300

    const containerDeg = 360 * slider.track.details.progress

    const slideDeg = 360 / slideCount
    slider.container.style.transform = `translateZ(-${z}px) rotateY(${-containerDeg}deg)`
    _.forEach(slider.slides, (slide, i) => {
      const slideRotation = slideDeg * i
      slide.style.transform = `rotateY(${slideRotation}deg) translateZ(${z}px)`
    })
  }
}

interface Props {
  children: ReactNode[]
}
const useKeen3DCarousel = () => {
  const { allTagBlock, myActions, dispatch } = useTagEditor()
  const { setState } = myActions
  const actionCreators = bindActionCreators({ setState }, dispatch)
  return { allTagBlock, ...actionCreators }
}

export const Keen3DCarousel: FC<Props> = (props) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { allTagBlock, setState } = useKeen3DCarousel()
  useEffect(() => {
    const blockID = allTagBlock[currentSlide].id
    setState({ blockID })
  }, [currentSlide])
  const { children } = props
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      selector: '.carousel__cell',
      renderMode: 'custom',
      mode: 'snap',
      drag: false,
      initial: 0,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
    },
    [carouselPlugin, MutationPlugin]
  )
  const changeSlide = (dir: 'left' | 'right'): void => {
    if (children.length <= 1) return
    dir === 'left' ? instanceRef.current?.prev() : instanceRef.current?.next()
  }
  return (
    <Box className='wrapper Keen3DCarousel'>
      <Box className='scene'>
        <IconBoxes changeSlide={changeSlide} />
        <div className='keen-slider' ref={sliderRef}>
          {_.map([...children], (child, i) => (
            <div key={i} className='carousel__cell'>
              {child}
            </div>
          ))}
        </div>
      </Box>
    </Box>
  )
}
interface IconBoxesProps {
  changeSlide: (dir: 'left' | 'right') => void
}
const IconBoxes: FC<IconBoxesProps> = (props) => {
  const { changeSlide } = props
  const iconProps: Omit<FontAwesomeIconProps, 'icon'> = { size: '3x', className: 'pointer', opacity: 0.5 }
  return (
    <>
      <Box className='left'>
        <ActionIcon variant='transparent' radius='xl' size='xl' onClick={(): void => changeSlide('left')}>
          <SFIcon icon='faChevronLeft' iconProps={iconProps} />
        </ActionIcon>
      </Box>
      <Box className='right'>
        <ActionIcon variant='transparent' radius='xl' size='xl' onClick={(): void => changeSlide('right')}>
          <SFIcon icon='faChevronRight' iconProps={iconProps} />
        </ActionIcon>
      </Box>
    </>
  )
}
