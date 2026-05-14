import { describe, expect, it } from 'vitest'
import { usePlaybackController } from './usePlaybackController'

describe('usePlaybackController', () => {
  it('cycles play modes', () => {
    const controller = usePlaybackController()

    expect(controller.playMode.value).toBe('none')
    expect(controller.cyclePlayMode()).toBe('all')
    expect(controller.cyclePlayMode()).toBe('one')
    expect(controller.cyclePlayMode()).toBe('shuffle')
    expect(controller.cyclePlayMode()).toBe('none')
  })

  it('delegates next index calculation to the current play mode', () => {
    const controller = usePlaybackController('all')

    expect(controller.getNextIndex(2, 3)).toBe(0)
    controller.setPlayMode('one')
    expect(controller.getNextIndex(2, 3)).toBe(2)
  })

  it('exposes a label for the current play mode', () => {
    const controller = usePlaybackController('shuffle')

    expect(controller.playModeLabel.value).toBe('シャッフル')
  })
})
