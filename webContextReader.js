import axios from 'axios';
import { convert } from 'html-to-text';

export async function webContextReader(source) {
    let url = source.trim();
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }
    const webContent = await axios.get(url);
    return convert(webContent.data);
}
