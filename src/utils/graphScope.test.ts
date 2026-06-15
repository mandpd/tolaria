import { describe, it, expect } from 'vitest'
import { entriesForGraphScope, viewMatchesGraphScope, withConnectedNeighbors } from './graphScope'
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

describe('withConnectedNeighbors', () => {
  const project = makeEntry({ path: 'proj.md', filename: 'proj.md', title: 'Laputa', isA: 'Project', outgoingLinks: ['owner'] })
  const owner = makeEntry({ path: 'owner.md', filename: 'owner.md', title: 'Owner', isA: 'Person' })
  const child = makeEntry({ path: 'child.md', filename: 'child.md', title: 'Child', belongsTo: ['[[proj]]'] })
  const unrelated = makeEntry({ path: 'misc.md', filename: 'misc.md', title: 'Misc' })

  it('adds notes the seed links out to', () => {
    const result = withConnectedNeighbors([project], [project, owner, unrelated])
    expect(result.map((e) => e.path).sort()).toEqual(['owner.md', 'proj.md'])
  })

  it('adds notes that link into the seed', () => {
    const result = withConnectedNeighbors([project], [project, child, unrelated])
    expect(result.map((e) => e.path).sort()).toEqual(['child.md', 'proj.md'])
  })

  it('leaves a seed with no connections unchanged', () => {
    const result = withConnectedNeighbors([unrelated], [project, owner, unrelated])
    expect(result).toEqual([unrelated])
  })
})

describe('entriesForGraphScope', () => {
  const person = makeEntry({ path: 'p.md', filename: 'p.md', title: 'Matteo', isA: 'Person' })
  const project = makeEntry({ path: 'proj.md', filename: 'proj.md', title: 'Laputa', isA: 'Project' })

  it('returns every entry for the "all" scope', () => {
    const result = entriesForGraphScope({ kind: 'all' }, [person, project], [])
    expect(result).toEqual([person, project])
  })

  it('returns the matched note plus its connected neighbors for a "view" scope', () => {
    const projectWithOwner = makeEntry({ path: 'proj.md', filename: 'proj.md', title: 'Laputa', isA: 'Project', outgoingLinks: ['p'] })
    const view = makeView({
      filename: 'projects.yml',
      definition: { name: 'Projects', icon: null, color: null, sort: null, filters: { all: [{ field: 'type', op: 'equals', value: 'Project' }] } },
    })
    const result = entriesForGraphScope(
      { kind: 'view', filename: 'projects.yml' },
      [person, projectWithOwner],
      [view],
    )
    // The Project note matches the view; the linked Person is pulled in as a neighbor.
    expect(result.map((e) => e.path).sort()).toEqual(['p.md', 'proj.md'])
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
