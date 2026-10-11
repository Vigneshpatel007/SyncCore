import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { errMsg } from '../utils/format';

/**
 * Custom hook: GET a URL and track loading / error state.
 * useEffect runs `load` when the component first appears (and when the url changes).
 * `reload` lets a page refresh its data after create / update / delete.
 */
export default function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(url)
      .then((res) => { setData(res.data); setError(''); })
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
