import { useContext } from 'react';
import { SavedContext } from '../context/SavedContext';

const useSaved = () => useContext(SavedContext);

export default useSaved;
