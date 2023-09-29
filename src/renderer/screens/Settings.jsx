import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';

export default function Settings() {
  const [id, setId] = React.useState(' ');
  const [url, setUrl] = React.useState(' ');
  const [interval, setInterval] = React.useState(' ');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'ID':
        setId(value);
        break;
      case 'URL':
        setUrl(value);
        break;
      case 'INTERVAL':
        setInterval(value);
        break;
      default:
        break;
    }
  };

  const inputs = [
    {
      label: 'ID',
      value: id,
    },
    {
      label: 'URL',
      value: url,
    },
    {
      label: 'INTERVAL',
      value: interval,
    },
  ];

  useEffect(() => {
    setId(window.electron.store.get('ID'));
    setUrl(window.electron.store.get('URL'));
    setInterval(window.electron.store.get('INTERVAL'));
  }, [setId, setUrl, setInterval]);

  const onSave = () => {
    // trim all inputs
    setId(id.trim());
    setUrl(url.trim())
    setInterval(interval.trim())
    if (!id || !url || !interval) {
      alert('Please all fields are mandatory!');
      return;
    }
    // interval must be a number
    if (isNaN(interval) || interval <= 0) {
      alert('Interval must be a number greater than 0!');
      return;
    }

    // valid url
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(url)) {
      alert('Please enter a valid URL!');
      return;
    }
    window.electron.store.set('ID', id);
    window.electron.store.set('URL', url);
    window.electron.store.set('INTERVAL', interval);
    navigate('/');
  };
  return (
    <div className="h-screen w-screen flex flex-col p-7">
      <div>
        <Logo />
      </div>
      <div className=" flex-1 flex items-center justify-center">
        <div className="p-10 border rounded-lg w-8/12 flex justify-center items-center flex-col gap-5 shadow-lg">
          {inputs.map((input) => (
            <div
              className="w-full flex flex-row justify-between items-center"
              key={input.label}
            >
              <label htmlFor={input.label}>{input.label}</label>
              <input
                name={input.label}
                id={input.label}
                value={input.value}
                onChange={handleChange}
                className="w-8/12 border rounded-lg p-2 focus:outline-blue-500"
              />
            </div>
          ))}
          <div className="w-full flex flex-row justify-between items-center">
            <div></div>
            <button
              className="bg-blue-500 text-white px-5 py-3 rounded-lg outline-none focus:outline-none"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
