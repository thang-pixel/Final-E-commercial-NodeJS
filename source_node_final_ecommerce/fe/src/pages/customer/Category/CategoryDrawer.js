import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function CategoryDrawer({ cates, isOpen, onClose }) {
    const drawerRef = useRef(null);
    const [hoveredCate, setHoveredCate] = useState(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay mờ */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-10 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Container flex */}
            <div className="fixed top-20 left-0 right-0 flex z-20 mx-8 my-4 ">
                {/* Drawer */}
                <div
                    ref={drawerRef}
                    className={`category-drawer bg-white w-64 h-auto md:max-h-96 md:overflow-y-auto rounded-xl md:rounded-l-xl`} 
                >
                    <ul>
                        {cates.map((cate, index) => {
                            const classFirstLast = index === 0
                                ? 'rounded-t-xl md:rounded-tl-xl md:rounded-tr-none'
                                : index === cates.length - 1
                                    ? 'rounded-b-xl md:rounded-bl-xl md:rounded-br-none'
                                    : '';

                            return (
                                <li
                                    key={index}
                                    className={`p-4 ${classFirstLast} border-b hover:bg-gray-100`}
                                    onMouseEnter={() => setHoveredCate(cate)}
                                    onMouseLeave={() => setHoveredCate(null)}
                                >
                                    <Link to={`/categories/${cate.toLowerCase()}`}>
                                        {cate}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Panel — chiếm toàn bộ phần còn lại */}
                <div className="panel-item flex-1 bg-red-500 text-white items-center justify-center rounded-tr-xl rounded-br-xl hidden md:flex">
                        <p>Panel cho {hoveredCate ? hoveredCate : cates[0]}</p>
                    </div>
            </div>
        </>
    );
}

export default CategoryDrawer;
