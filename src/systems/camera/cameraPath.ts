import type { AppState, CameraPose, Civilization } from '../../types/museum'
import { ATRIUM, ROOMS, ATRIUM_RADIUS_EXPORT as RADIUS, polarToWorld } from '../../data/world'
import { getExhibit } from '../../data/exhibits'

const ROOM_STATES: ReadonlySet<AppState> = new Set(['GREECE','ROME','EGYPT'])
function isRoomState(state:AppState):state is 'GREECE'|'ROME'|'EGYPT' {return ROOM_STATES.has(state)}
function civOf(state:'GREECE'|'ROME'|'EGYPT'):Civilization {return state.toLowerCase() as Civilization}

export function getRestingPose(appState:AppState,selectedId:string|null):CameraPose {
  if(appState==='WELCOME')return ATRIUM.welcomeCamera
  if(appState==='ATRIUM')return ATRIUM.camera
  if(appState==='EXHIBIT_VIEW')return (selectedId?getExhibit(selectedId):undefined)?.cameraFocus ?? ATRIUM.camera
  if(isRoomState(appState))return ROOMS[civOf(appState)].roomCamera
  return ATRIUM.camera
}

/** Stay out of the central artwork when approaching a distant arch from the hub. */
function insideAtrium(civ:Civilization):CameraPose[] {
  const a=ROOMS[civ].entranceAngle
  const entry=polarToWorld(a,RADIUS-3.1)
  const target=polarToWorld(a,RADIUS+4.0)
  const approaching: CameraPose = {position:[entry[0],3.65,entry[2]],target:[target[0],3.0,target[2]],fov:57}
  if(civ==='greece') {
    return [
      {position:[-4.1,3.8,3.9],target:[-3.4,3,-3.5],fov:55},
      {position:[-4.1,3.75,-3.65],target:[0,3,-9],fov:55},
      approaching,
    ]
  }
  return [approaching]
}

/** One waypoint just outside each doorway and another in the middle of the corridor. */
function intoRoom(civ:Civilization):CameraPose[] {
  const room=ROOMS[civ]
  const doorway=polarToWorld(room.entranceAngle,RADIUS+1.6)
  const threshold=room.passageWaypoints[0]
  return [
    {position:[doorway[0],3.65,doorway[2]],target:threshold.target,fov:54},
    {position:threshold.position,target:threshold.target,fov:52},
    room.roomCamera,
  ]
}

function fromRoom(civ:Civilization):CameraPose[] {
  const route=intoRoom(civ)
  return [route[1],route[0],...insideAtrium(civ).reverse()]
}

/** All room-to-room routes pass through the real passage network and avoid the central artwork. */
export function buildTransitionPath(previous:AppState,next:AppState,selectedId:string|null,previousSelectedId:string|null=null):CameraPose[] {
  if(next==='EXHIBIT_VIEW')return [getRestingPose(next,selectedId)]
  if(previous==='EXHIBIT_VIEW'&&isRoomState(next)) {
    const previousRoom = previousSelectedId ? getExhibit(previousSelectedId)?.civilization : undefined
    const nextRoom = civOf(next)
    if (previousRoom && previousRoom !== nextRoom) return [
      ROOMS[previousRoom].roomCamera, ...fromRoom(previousRoom), ATRIUM.camera,
      ...insideAtrium(nextRoom), ...intoRoom(nextRoom),
    ]
    return [ROOMS[nextRoom].roomCamera]
  }
  if(previous==='ATRIUM'&&isRoomState(next))return [...insideAtrium(civOf(next)),...intoRoom(civOf(next))]
  if(isRoomState(previous)&&next==='ATRIUM')return [...fromRoom(civOf(previous)),ATRIUM.camera]
  if(isRoomState(previous)&&isRoomState(next))return [
    ...fromRoom(civOf(previous)),ATRIUM.camera,...insideAtrium(civOf(next)),...intoRoom(civOf(next))
  ]
  return [getRestingPose(next,selectedId)]
}
