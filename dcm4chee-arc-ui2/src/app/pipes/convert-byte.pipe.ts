import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertByte'
})
export class ConvertBytePipe implements PipeTransform {
    private units = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB',
        'PB'
    ];
    transform(bytes: number = 0, precision: number = 2 ) : string {
        if ( isNaN( parseFloat( String(bytes) )) || ! isFinite( bytes ) ) return '?';

        let unit = 0;

        while ( bytes >= 1000 ) {
            bytes /= 1000;
            unit ++;
        }
        return bytes.toFixed( + precision ) + ' ' + this.units[ unit ];
    }
}
