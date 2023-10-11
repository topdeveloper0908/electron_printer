import { useState, useEffect, useRef } from 'react';
import { BsFillGearFill, BsPrinter, BsTextCenter } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import {} from 'react';
import { Logo } from '../components/Logo';
import Details from './Details';
import axios from 'axios';

/**
 * 3. How the APP should work
a. After start you see a LOGO left, on the right side 2a) and the Intervall Counter decreasing to zero
b. Fetching the data from a Service-API URL in JSON-Format and printed to a connected printer - the data should also be saved (Online Order from an Online Shop) in a List and on click you can see details oft he Order or Print the Order again.

Fetch an open order => "filiale" comes from saved input in APP
	https://www.pizzamann.at/apiver200/printorder?filiale=1560

Close an open order after printing=> ("id" comes from the order)
	https://www.pizzamann.at/apiver200/closeprintorder?id=1003319


Following fields has to be printed for the start => all fields in "json" for the start
(l_vorname, l_nachname,...)
        
        json {
          abholfiliale
: 
"(1560 | 5020 Salzburg, Aiglhofstraße, 1)"
code
: 
"12drei"
minute
: 
"00"
smstrack
: 
false
stunde
: 
"21"
zustellzeit
: 
"uhrzeit"
        }
 */

export default function Print() {
  const navigate = useNavigate();
  const MODES = {
    PREVIEW: 'preview',
    PRINT: 'print',
    NORMAL: 'normal',
  };
  const [mode, setMode] = useState(MODES.NORMAL);
  const [prevMode, setPrevMode] = useState(MODES.NORMAL);

  interface IOrder {
    time: any;
    id: string;
    bestell_zeilen: any[];
    json: any;
  }

  const [activeOrder, setActiveOrder] = useState<IOrder | null>(null);

  // orders are also saved on system store
  const [savedOrders, setSavedOrders] = useState<any[]>(
    window.electron.store.get('ORDERS') || [],
  );

  const [savedInterval, setSavedInterval] = useState(
    Number(window.electron.store.get('INTERVAL')) || 10,
  );
  const [countDownValue, setCountDownValue] = useState(savedInterval);
  const [savedUrl, setSavedUrl] = useState(window.electron.store.get('URL'));
  const [isRequesting, setIsRequesting] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const messageSentRef = useRef(false);

  async function fetchOrder(prev: number): Promise<number> {
    if (isRequesting || messageSent || messageSentRef.current) {
      return savedInterval;
    }
    if (mode !== MODES.NORMAL) {
      return savedInterval;
    }
    if (prev === 0) {
      try {
        setIsRequesting(true);
        const res = await axios.get(savedUrl);
        const order = res.data.order;
        const newOrder: IOrder = {
          bestell_zeilen: order.bestell_zeilen,
          time: order.time,
          id: order.id,
          json: order.json,
        };
        setActiveOrder(newOrder);
        const orders = savedOrders;
        if (
          orders.find(
            (order) => order.id === newOrder.id && order.time === newOrder.time,
          )
        ) {
          setIsRequesting(false);
          return savedInterval;
        }
        orders.push(newOrder);
        window.electron.store.set('ORDERS', orders);
        handlePrint();
        setSavedOrders(orders);
      } catch (error) {
        setIsRequesting(false);
        setMessageSent(false);
        messageSentRef.current = false;
      } finally {
        return savedInterval;
      }
    }
    return prev - 1;
  }
  const handlePrint = () => {
    setPrevMode(mode);
    setMode(MODES.PRINT);
    let style =
      'text-align: left; display: flex; margin: 5px 0px; padding: 0px; justify-content: space-between; width: 90vw;';
    if (!messageSentRef.current) {
      window.electron.ipcRenderer.sendMessage('print', [
        {
          type: 'image',
          path: window.electron.utils.getFilePath('logo.png'), // path of image
          position: 'left', // position of image: 'left' | 'center' | 'right'
          width: 'auto', // width of image in px; default: auto
          height: '50px', // width of image in px; default: 50 or '50px'
        },
        {},
        // order id
        {
          type: 'text',
          value: `Order: <strong>${activeOrder?.id}</strong>`,
          fontsize: 4,
          style,
        },
        {
          type: 'text',
          value: `Name: <strong>${activeOrder?.json?.l_vorname} ${activeOrder?.json?.l_nachname}</strong>`,
          fontsize: 4,
          style,
        },
        {
          type: 'text',
          value: `Address: <strong>${activeOrder?.json?.l_adresse}</strong>`,
          fontsize: 4,
          style,
        },
        // activeOrder? time
        {
          type: 'text',
          value: `Time: <strong>${Intl.DateTimeFormat('de-AT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(activeOrder?.time)}<strong>`,
          fontsize: 4,
          style,
        },
        {
          type: 'table',
          // style the table
          style:
            'border: 1px solid #ddd; text-align: center; width: 90vw; margin: 10px 0px;',
          // list of the columns to be rendered in the table header
          tableHeader: ['Name', 'Price', 'Qty', 'Total'],
          // multi dimensional array depicting the rows and columns of the table body
          tableBody: [
            ...(activeOrder?.bestell_zeilen.map((item) => [
              `<span style="text-align: left; width: 100%; display block; margin: 0px; padding: 0px;"
              >${item.name}</span>`,
              item.preis,
              item.menge,
              item.preis * item.menge,
            ]) as any),
            [
              'Total',
              activeOrder?.bestell_zeilen.reduce((a, b) => a + b.preis, 0),
              activeOrder?.bestell_zeilen.reduce((a, b) => a + b.menge, 0),
              activeOrder?.bestell_zeilen.reduce(
                (a, b) => a + b.preis * b.menge,
                0,
              ),
            ],
          ],
          // custom style for the table body
          tableBodyStyle: 'text-align: left;',
        },
      ]);
      setMessageSent(true); // Update the state
      messageSentRef.current = true; // Update the ref
    }
  };

  useEffect(() => {
    if (messageSent && messageSentRef.current) {
      window.electron.ipcRenderer.once('print', ({ success, error }: any) => {
        if (error) {
          console.log(error);
          alert('Print canceled');
        }
        axios
          .get(
            'https://www.pizzamann.at/apiver200/closeprintorder?id=' +
              activeOrder?.id,
          )
          .catch((err) => console.log(err));
        setMode(prevMode);
        setIsRequesting(false);
        setMessageSent(false);
        messageSentRef.current = false;
      });
    }
  }, [mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      async function count() {
        const prev = await fetchOrder(countDownValue);
        setCountDownValue(prev);
      }
      count();
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownValue, mode]);

  const onPreview = (order: IOrder) => {
    setActiveOrder(order);
    setMode(MODES.PREVIEW);
  };
  return mode === MODES.NORMAL ? (
    <div className="h-screen w-screen flex flex-col p-7 gap-6 justify-between">
      <div className="flex justify-between items-center">
        <Logo />
        <div>
          <span
            className={
              'text-4xl font-bold ' +
              (countDownValue == 0 ? 'text-red-500' : 'text-blue-500')
            }
          >
            {countDownValue}
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-5 w-full">
        <div className="w-full flex justify-between items-center">
          <div></div>
          <div>
            <button
              className="bg-red-500 text-white px-3 py-2 rounded"
              onClick={() => {
                window.electron.store.set('ORDERS', []);
                setSavedOrders([]);
              }}
            >
              Delete All
            </button>
          </div>
        </div>
        <div className="w-full max-h-[60vh] overflow-auto">
          <table className="w-full text-left">
            <thead className="">
              <tr className="hover:bg-[dodgerblue]">
                <th>Date</th>
                <th>Order</th>
                <th>Names</th>
                <th className="text-center">Print</th>
                <th className="text-center">Detail</th>
              </tr>
            </thead>
            <tbody>
              {savedOrders?.map((order, index) => {
                return (
                  <tr key={index}>
                    <td>
                      {Intl.DateTimeFormat('de-AT', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).format(order.time)}
                    </td>
                    <td>{order.id}</td>
                    <td>
                      {order.json?.l_vorname + ' ' + order.json?.l_nachname}
                    </td>
                    <td className="text-center">
                      <button
                        className="bg-green-500 text-white p-3 rounded"
                        onClick={() => {
                          setActiveOrder(order);
                          handlePrint();
                        }}
                      >
                        <BsPrinter />
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        className="bg-orange-500 text-white p-3 rounded"
                        onClick={() => {
                          onPreview(order);
                        }}
                      >
                        <BsTextCenter />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full flex justify-between items-center p-4">
        <div></div>
        <div className="text-2xl text-blue-500">
          <BsFillGearFill
            className=" cursor-pointer"
            onClick={() => navigate('/settings')}
          />
        </div>
      </div>
    </div>
  ) : (
    <Details
      order={activeOrder}
      mode={mode}
      setMode={setMode}
      handlePrint={handlePrint}
    />
  );
}
