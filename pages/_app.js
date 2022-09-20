import '../styles/globals.css'
import Link from 'next/link'
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
      window.addEventListener("scroll", changeNavBGColour);
  }, []);

  const getNavHeaderStyle = () => {
    if (scrollY >= 0){
      return "fixed w-full z-30 top-0 shadow bg-white";
    }
  };

  const getNavContentStyle = () => {
    if (scrollY >= 0){
      return "w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 bg-white lg:bg-white text-black p-4 lg:p-0 z-20 bg-white";
    }
  };

  const getNavActionStyle = () => {
    if (scrollY >= 0){
      return "mx-auto lg:mx-0 hover:underline gradient text-white font-bold rounded-full mt-4 lg:mt-0 py-4 px-8 shadow opacity-75 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out";
    }
  };

  const toggleTextStyle = (classes) => {
    if (scrollY >= 0){
      return classes + " text-gray-800";
    }
  };

  function changeNavBGColour() {
      setScrollY(window.scrollY);
    }

  return (
  <div>
    <nav id="header" className={getNavHeaderStyle()}>
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className='pl-4 flex items-center'>
            <Link href="/">
              <a className={toggleTextStyle('mr-6 text-xl font-bold')}>
              NFT Marketplace (Polygon Testnet)
              </a>
            </Link>
            <div className="block lg:hidden pr-4">
              <button id="nav-toggle" className="flex items-center p-1 text-pink-800 hover:text-gray-900 focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out">
                <svg className="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <title>Menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
              </button>
            </div>
            <div className={getNavContentStyle()} id="nav-content">
              <ul className="list-reset lg:flex justify-end flex-1 items-center">
                <li className="mr-3">
                  <Link href="/marketplace">
                    <a className={toggleTextStyle('inline-block text-white no-underline hover:text-gray-800 hover:text-underline py-2 px-4')}>
                      Market
                    </a>
                  </Link>
                </li>
                
                <li className="mr-3">
                <Link href="/create-item">
                  <a className={toggleTextStyle('inline-block text-white no-underline hover:text-gray-800 hover:text-underline py-2 px-4')}>
                    Sell Assets
                  </a>
                </Link>
                </li>
                <li className="mr-3">
                <Link href="/my-assets">
                  <a className={toggleTextStyle('inline-block text-white no-underline hover:text-gray-800 hover:text-underline py-2 px-4')}>
                    My Assets
                  </a>
                </Link>
                </li>
                <li className="mr-3">
                <Link href="/creator-dashboard">
                  <a className={toggleTextStyle('inline-block text-white no-underline hover:text-gray-800 hover:text-underline py-2 px-4')}>
                    Creator Dashboard
                  </a>
                </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
    </nav>
    <Component {...pageProps} />
  </div>
  )
}

export default MyApp
