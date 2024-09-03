import InputOne from '../Input/InputOne'
import DisplayedResult from './DisplayedResult'

const Results = () => {
  return (
    <div className=''>
        <div className='flex justify-center my-1 mx-2'>
            <InputOne />
        </div>
        <div className=''>
          <DisplayedResult />
        </div>
    </div>
  )
}

export default Results;