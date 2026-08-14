import { useContext } from 'react';

import { AppContext } from '../../context/AppContext';

const useAppSelector = () => {
  const { state } = useContext(AppContext);

  return state;
};

export default useAppSelector;
