import test from 'node:test'
import assert from 'node:assert/strict'
import { initialMuseumState, museumReducer } from '../src/app/appReducer.ts'

const act = (state, action) => museumReducer(state, action)
const ready = state => act(state, { type: 'SET_TRANSITIONING', value: false })

const entered = () => ready(act(initialMuseumState, { type: 'ENTER_MUSEUM' }))

test('the visitor starts at the welcome screen', () => {
  assert.equal(initialMuseumState.appState, 'WELCOME')
  assert.equal(initialMuseumState.activeRoom, null)
  assert.equal(initialMuseumState.selectedExhibitId, null)
})

test('entering once opens the atrium, repeated entries are no-ops', () => {
  const entering = act(initialMuseumState, { type: 'ENTER_MUSEUM' })
  assert.equal(entering.appState, 'ATRIUM')
  assert.equal(entering.isTransitioning, true)
  assert.equal(act(entering, { type: 'ENTER_MUSEUM' }), entering)
})

test('the visitor cannot bypass the welcome without entering', () => {
  assert.equal(act(initialMuseumState, { type: 'GO_TO_ROOM', room: 'egypt' }), initialMuseumState)
  assert.equal(act(initialMuseumState, { type: 'SELECT_EXHIBIT', room: 'egypt', exhibitId: 'anubis' }), initialMuseumState)
})

test('atrium → Greece → Athena → Greece → atrium', () => {
  const entering = entered()
  const greeceMoving = act(entering, { type: 'GO_TO_ROOM', room: 'greece' })
  assert.equal(greeceMoving.isTransitioning, true)
  assert.equal(greeceMoving.appState, 'GREECE')
  assert.equal(act(greeceMoving, { type: 'GO_TO_ROOM', room: 'rome' }), greeceMoving)
  const greece = ready(greeceMoving)
  const inspecting = act(greece, { type: 'SELECT_EXHIBIT', room: 'greece', exhibitId: 'athena' })
  assert.equal(inspecting.appState, 'EXHIBIT_VIEW')
  assert.equal(inspecting.selectedExhibitId, 'athena')
  const back = act(ready(inspecting), { type: 'RETURN_TO_ROOM' })
  assert.equal(back.appState, 'GREECE')
  assert.equal(back.selectedExhibitId, null)
  const atrium = act(ready(back), { type: 'RETURN_TO_ATRIUM' })
  assert.equal(atrium.appState, 'ATRIUM')
  assert.equal(atrium.activeRoom, null)
})

test('a room cannot select an unrelated exhibit while walking', () => {
  const greece = ready(act(entered(), { type: 'GO_TO_ROOM', room: 'greece' }))
  assert.equal(act(greece, { type: 'SELECT_EXHIBIT', room: 'rome', exhibitId: 'jupiter' }), greece)
  assert.equal(act(greece, { type: 'RETURN_TO_ROOM' }).appState, 'GREECE')
})

test('direct transitions between civilizations keep the selected model cleared', () => {
  const greece = ready(act(entered(), { type: 'GO_TO_ROOM', room: 'greece' }))
  const egypt = act(greece, { type: 'GO_TO_ROOM', room: 'egypt' })
  assert.equal(egypt.appState, 'EGYPT')
  assert.equal(egypt.activeRoom, 'egypt')
  assert.equal(egypt.selectedExhibitId, null)
  const rome = act(ready(egypt), { type: 'GO_TO_ROOM', room: 'rome' })
  assert.equal(rome.activeRoom, 'rome')
})
