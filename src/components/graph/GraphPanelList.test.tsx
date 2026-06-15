import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GraphPanelList } from './GraphPanelList'
import type { VaultEntry, ViewFile } from '../../types'

function makeEntry(path: string, title: string, isA: string | null, overrides: Partial<VaultEntry> = {}): VaultEntry {
  return {
    path, filename: path, title, isA,
    aliases: [], belongsTo: [], relatedTo: [], status: null, archived: false,
    modifiedAt: null, createdAt: null, fileSize: 0, snippet: '', wordCount: 0,
    relationships: {}, icon: null, color: null, order: null, sidebarLabel: null,
    template: null, sort: null, view: null, visible: null, organized: false,
    favorite: false, favoriteIndex: null, listPropertiesDisplay: [],
    outgoingLinks: [], properties: {}, hasH1: false,
    ...overrides,
  }
}

function projectsView(): ViewFile {
  return {
    filename: 'projects.yml',
    definition: {
      name: 'Active Projects', icon: 'rocket', color: 'blue', sort: null,
      filters: { all: [{ field: 'type', op: 'equals', value: 'Project' }] },
    },
  }
}

const entries = [
  makeEntry('a.md', 'Laputa App V1', 'Project', { snippet: 'The first usable release.', createdAt: 1_700_000_000 }),
  makeEntry('b.md', 'Laputa App V2', 'Project', { snippet: 'The active polish project.' }),
  makeEntry('person.md', 'Luca', 'Person'),
]

describe('GraphPanelList', () => {
  it('renders "All" plus one item per note matched by each view', () => {
    render(
      <GraphPanelList entries={entries} views={[projectsView()]} scope={{ kind: 'all' }} onSelectScope={() => {}} />,
    )
    expect(screen.getByText('All')).toBeInTheDocument()
    // The view name heads the group; its matched Project notes are listed.
    expect(screen.getByText('Active Projects')).toBeInTheDocument()
    expect(screen.getByText('Laputa App V1')).toBeInTheDocument()
    expect(screen.getByText('Laputa App V2')).toBeInTheDocument()
    // A note that does not match the view is not listed.
    expect(screen.queryByText('Luca')).not.toBeInTheDocument()
  })

  it('mirrors the note list row content: snippet and created date', () => {
    render(
      <GraphPanelList entries={entries} views={[projectsView()]} scope={{ kind: 'all' }} onSelectScope={() => {}} />,
    )
    expect(screen.getByText('The first usable release.')).toBeInTheDocument()
    expect(screen.getByText(/^Created /)).toBeInTheDocument()
  })

  it('scopes the graph to a single note when its item is clicked', () => {
    const onSelectScope = vi.fn()
    render(
      <GraphPanelList entries={entries} views={[projectsView()]} scope={{ kind: 'all' }} onSelectScope={onSelectScope} />,
    )
    fireEvent.click(screen.getByText('Laputa App V2'))
    expect(onSelectScope).toHaveBeenCalledWith({ kind: 'note', path: 'b.md' })
  })

  it('selects the whole graph when "All" is clicked', () => {
    const onSelectScope = vi.fn()
    render(
      <GraphPanelList entries={entries} views={[projectsView()]} scope={{ kind: 'note', path: 'a.md' }} onSelectScope={onSelectScope} />,
    )
    fireEvent.click(screen.getByText('All'))
    expect(onSelectScope).toHaveBeenCalledWith({ kind: 'all' })
  })
})
