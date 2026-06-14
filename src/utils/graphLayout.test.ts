import { describe, it, expect } from 'vitest'
import { buildGraphData, pathLabel } from './graphLayout'
import type { VaultEntry } from '../types'

function makeEntry(overrides: Partial<VaultEntry> = {}): VaultEntry {
  return {
    path: 'test-note.md',
    filename: 'test-note.md',
    title: 'Test Note',
    isA: null,
    aliases: [],
    belongsTo: [],
    relatedTo: [],
    status: null,
    archived: false,
    modifiedAt: null,
    createdAt: null,
    fileSize: 0,
    snippet: '',
    wordCount: 0,
    relationships: {},
    icon: null,
    color: null,
    order: null,
    sidebarLabel: null,
    template: null,
    sort: null,
    view: null,
    visible: null,
    organized: false,
    favorite: false,
    favoriteIndex: null,
    listPropertiesDisplay: [],
    outgoingLinks: [],
    properties: {},
    hasH1: false,
    ...overrides,
  }
}

describe('pathLabel', () => {
  it('extracts last path segment', () => {
    expect(pathLabel('project/my-note.md')).toBe('my-note')
  })

  it('returns filename without extension', () => {
    expect(pathLabel('simple.md')).toBe('simple')
  })

  it('handles nested paths', () => {
    expect(pathLabel('a/b/c/deep.md')).toBe('deep')
  })

  it('handles path without extension', () => {
    expect(pathLabel('folder/readme')).toBe('readme')
  })
})

describe('buildGraphData', () => {
  it('creates nodes for all entries', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A' }),
      makeEntry({ path: 'b.md', filename: 'b.md', title: 'B' }),
    ]
    const { nodes } = buildGraphData(entries)
    expect(nodes).toHaveLength(2)
    expect(nodes.map((n) => n.id)).toEqual(['a.md', 'b.md'])
  })

  it('creates edges from outgoingLinks matched by filename stem', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', outgoingLinks: ['b'] }),
      makeEntry({ path: 'b.md', filename: 'b.md', title: 'B' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'a.md',
      target: 'b.md',
      kind: 'wikilink',
    })
  })

  it('creates edges from outgoingLinks matched by title', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'Note A', outgoingLinks: ['Note B'] }),
      makeEntry({ path: 'b.md', filename: 'b.md', title: 'Note B' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'a.md',
      target: 'b.md',
      kind: 'wikilink',
    })
  })

  it('creates edges from relatedTo with wikilink refs', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', relatedTo: ['[[c]]'] }),
      makeEntry({ path: 'c.md', filename: 'c.md', title: 'C' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'a.md',
      target: 'c.md',
      kind: 'relates-to',
    })
  })

  it('creates edges from generic relationships', () => {
    const entries = [
      makeEntry({
        path: 'a.md',
        filename: 'a.md',
        title: 'A',
        relationships: { parent: ['[[d]]'] },
      }),
      makeEntry({ path: 'd.md', filename: 'd.md', title: 'D' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'a.md',
      target: 'd.md',
      kind: 'relationship',
    })
  })

  it('filters edges to targets that cannot be resolved', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', outgoingLinks: ['missing'] }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(0)
  })

  it('deduplicates edges with the same source and target', () => {
    const entries = [
      makeEntry({
        path: 'a.md',
        filename: 'a.md',
        title: 'A',
        outgoingLinks: ['b', 'b'],
      }),
      makeEntry({ path: 'b.md', filename: 'b.md', title: 'B' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
  })

  it('skips self-referential links', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', outgoingLinks: ['a'] }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(0)
  })

  it('creates edges from belongsTo with wikilink refs', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', belongsTo: ['[[parent]]'] }),
      makeEntry({ path: 'parent.md', filename: 'parent.md', title: 'Parent' }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(1)
    expect(edges[0]).toMatchObject({
      source: 'a.md',
      target: 'parent.md',
      kind: 'relates-to',
    })
  })

  it('handles empty entry list', () => {
    const { nodes, edges } = buildGraphData([])
    expect(nodes).toHaveLength(0)
    expect(edges).toHaveLength(0)
  })

  it('handles bidirectional links', () => {
    const entries = [
      makeEntry({ path: 'a.md', filename: 'a.md', title: 'A', outgoingLinks: ['b'] }),
      makeEntry({ path: 'b.md', filename: 'b.md', title: 'B', outgoingLinks: ['a'] }),
    ]
    const { edges } = buildGraphData(entries)
    expect(edges).toHaveLength(2)
  })

  it('includes node metadata', () => {
    const entries = [
      makeEntry({
        path: 'a.md',
        filename: 'a.md',
        title: 'Note A',
        isA: 'Person',
        icon: 'user',
        color: 'blue',
      }),
    ]
    const { nodes } = buildGraphData(entries)
    expect(nodes[0]).toMatchObject({
      id: 'a.md',
      title: 'Note A',
      type: 'Person',
      icon: 'user',
      color: 'blue',
    })
  })
})