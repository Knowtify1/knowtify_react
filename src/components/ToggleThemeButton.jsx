import { Button } from 'antd'
import React from 'react'
import { HiOutlineSun, HiOutlineMoon} from 'react-icons/hi'

export const ToggleThemeButton = ({darkTheme, toggleTheme}) => {
  return (
    <div className='toggle-the-btn'>
        <Button onClick={toggleTheme}>
            {darkTheme? <HiOutlineSun/> :
            <HiOutlineMoon/>}
        </Button>
    </div>
  )
}

