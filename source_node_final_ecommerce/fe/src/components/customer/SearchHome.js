import { OutlinedInput, InputAdornment, FormControl } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useState } from 'react';
import { API_DOMAIN } from '../../constants/apiDomain';

function SearchHome() {
    const [keyword, setKeyword] = useState('');
    const handleSearch = async () => {
        console.log('Searching for:', keyword);

        try {
            const response = await fetch(
                API_DOMAIN + '/api/products/search?keyword=' + keyword
            );
            if (response.ok) {
                const data = await response.json();
                console.log(data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <FormControl variant="filled" size="small">
            <OutlinedInput
                id="input-with-icon-adornment"
                placeholder="Nhập từ khóa"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                    }
                }}
                endAdornment={
                    <InputAdornment position="end">
                        <Search onClick={handleSearch} />
                    </InputAdornment>
                }
            />
        </FormControl>
    );
}

export default SearchHome;
