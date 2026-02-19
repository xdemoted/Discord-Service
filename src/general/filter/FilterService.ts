import * as fs from 'fs';
import { Singleton } from 'src/container/Singleton';

@Singleton
export class FilterService {
    private filterList: string[] = this.getFilteredWords();

    private getFilteredWords(): string[] {
        const data = fs.readFileSync('src/resources/filterlist.csv', 'utf-8');
        return data.split('\n').map(word => word.trim().replace(",","").toLowerCase()).filter(word => word.length > 0);
    }

    public isMessageClean(message: string): boolean {
        const messageLower = message.toLowerCase();
        for (const word of this.filterList) {
            if (messageLower.includes(word)) {
                return false;
            }
        }
        return true;
    }

    public applyDiscordFilter(message: string): string {
        const words = message.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            const wordLower = words[i].toLowerCase();
            for (const filteredWord of this.filterList) {
                if (wordLower.includes(filteredWord)) {
                    const regex = new RegExp(filteredWord, 'gi');
                    words[i] = words[i].replace(regex, '\\*'.repeat(filteredWord.length));
                }
            }
        }
        return words.join(' ').replace("@", "＠");
    }
}