import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GraphView } from './GraphView'
import type { VaultEntry } from '../../types'

function makeEntry(path: string, title: string, outgoingLinks: string[] = []): VaultEntry {
  return {
    path, filename: path, title, isA: null,
    aliases: [], belongsTo: [], relatedTo: [], status: null, archived: false,
    modifiedAt: null, createdAt: null, fileSize: 0, snippet: '', wordCount: 0,
    relationships: {}, icon: null, color: null, order: null, sidebarLabel: null,
    template: null, sort: null, view: null, visible: null, organized: false,
    favorite: false, favoriteIndex: null, listPropertiesDisplay: [],
    outgoingLinks, properties: {}, hasH1: false,
  }
}

describe('GraphView', () => {
  it('shows the empty message when there are no nodes', () => {
    render(<GraphView entries={[]} onNavigate={() => {}} />)
    expect(screen.getByText(/No notes with links/i)).toBeInTheDocument()
  })

  it('re-renders the graph when the entries change instead of keeping the first set', () => {
    const first = [makeEntry('a.md', 'Alpha', ['b']), makeEntry('b.md', 'Beta')]
    const { rerender } = render(<GraphView entries={first} onNavigate={() => {}} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()

    // Switching scope hands GraphView a different set of entries. The canvas
    // must reflect the new nodes, not stay stuck on the initial graph.
    const second = [makeEntry('c.md', 'Gamma', ['d']), makeEntry('d.md', 'Delta')]
    rerender(<GraphView entries={second} onNavigate={() => {}} />)
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.getByText('Delta')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })
})
