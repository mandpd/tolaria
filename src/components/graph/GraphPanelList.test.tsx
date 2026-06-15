import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GraphPanelList } from './GraphPanelList'
import type { ViewFile } from '../../types'

function makeView(name: string, filename: string): ViewFile {
  return {
    filename,
    definition: { name, icon: null, color: null, sort: null, filters: { all: [] } },
  }
}

describe('GraphPanelList', () => {
  it('renders an "All" item followed by one item per view', () => {
    render(
      <GraphPanelList
        views={[makeView('People', 'people.yml'), makeView('Projects', 'projects.yml')]}
        scope={{ kind: 'all' }}
        onSelectScope={() => {}}
      />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('selects the whole graph when "All" is clicked', () => {
    const onSelectScope = vi.fn()
    render(
      <GraphPanelList views={[makeView('People', 'people.yml')]} scope={{ kind: 'view', filename: 'people.yml' }} onSelectScope={onSelectScope} />,
    )
    fireEvent.click(screen.getByText('All'))
    expect(onSelectScope).toHaveBeenCalledWith({ kind: 'all' })
  })

  it('selects a view scope when a view item is clicked', () => {
    const onSelectScope = vi.fn()
    render(
      <GraphPanelList views={[makeView('People', 'people.yml')]} scope={{ kind: 'all' }} onSelectScope={onSelectScope} />,
    )
    fireEvent.click(screen.getByText('People'))
    expect(onSelectScope).toHaveBeenCalledWith({ kind: 'view', filename: 'people.yml', rootPath: undefined })
  })
})
