import { describe, it, expect } from 'vitest'
import { entriesForGraphScope, viewMatchesGraphScope } from './graphScope'
import type { VaultEntry, ViewFile } from '../types'

function makeEntry(overrides: Partial<VaultEntry> = {}): VaultEntry {
  return {
    path: 'note.md',
    filename: 'note.md',
    title: 'Note',
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

function makeView(overrides: Partial<ViewFile> = {}): ViewFile {
  return {
    filename: 'people.yml',
    definition: {
      name: 'People',
      icon: null,
      color: null,
      sort: null,
      filters: { all: [{ field: 'type', op: 'equals', value: 'Person' }] },
    },
    ...overrides,
  }
}

describe('viewMatchesGraphScope', () => {
  it('matches on filename and rootPath', () => {
    const view = makeView({ filename: 'a.yml', rootPath: '/vault' })
    expect(viewMatchesGraphScope(view, { kind: 'view', filename: 'a.yml', rootPath: '/vault' })).toBe(true)
    expect(viewMatchesGraphScope(view, { kind: 'view', filename: 'a.yml' })).toBe(false)
    expect(viewMatchesGraphScope(view, { kind: 'view', filename: 'b.yml', rootPath: '/vault' })).toBe(false)
  })

  it('treats missing rootPath as undefined on both sides', () => {
    const view = makeView({ filename: 'a.yml' })
    expect(viewMatchesGraphScope(view, { kind: 'view', filename: 'a.yml' })).toBe(true)
  })
})

describe('entriesForGraphScope', () => {
  const person = makeEntry({ path: 'p.md', filename: 'p.md', title: 'Matteo', isA: 'Person' })
  const project = makeEntry({ path: 'proj.md', filename: 'proj.md', title: 'Laputa', isA: 'Project' })

  it('returns every entry for the "all" scope', () => {
    const result = entriesForGraphScope({ kind: 'all' }, [person, project], [])
    expect(result).toEqual([person, project])
  })

  it('returns only the matching entries for a "view" scope', () => {
    const view = makeView()
    const result = entriesForGraphScope(
      { kind: 'view', filename: 'people.yml' },
      [person, project],
      [view],
    )
    expect(result).toEqual([person])
  })

  it('returns an empty list when the view cannot be found', () => {
    const result = entriesForGraphScope(
      { kind: 'view', filename: 'missing.yml' },
      [person, project],
      [makeView()],
    )
    expect(result).toEqual([])
  })
})
