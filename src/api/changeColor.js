export function changeColorByRating(rating) {

    if(rating == 0) return 'color: #000000';
    if(rating < 1200) return 'color: #808080';
    if(rating < 1400) return 'color: #008000';
    if(rating < 1600) return 'color: #03a89e';
    if(rating < 1900) return 'color: #0000ff';
    if(rating < 2100) return 'color: #aa00aa';
    if(rating < 2300) return 'color: #ff8c00';
    if(rating < 2400) return 'color: #ff8c00';
    if(rating < 2600) return 'color: #ff0000';
    if(rating < 3000) return 'color: #ff0000';
}