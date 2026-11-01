import { ArrowUpRight } from 'lucide-react'
import './EnterButton.css'
export interface EnterButtonProps {onClick:()=>void;disabled?:boolean}
export function EnterButton({onClick,disabled}:EnterButtonProps){
  return <button type="button" className="enter-button" onClick={onClick} disabled={disabled}>
    <span>ENTER THE MUSEUM</span><ArrowUpRight size={18} strokeWidth={1.25} aria-hidden="true"/>
  </button>
}
