const response = await fetch('./state.json');
const state = await response.json();

const board = document.querySelector('#board')

function init() {
    generate_level(state.settings.tiles);
    const preset = state.settings.level01;
    map_init(preset, state.settings.tiles);
}

function generate_level(tiles, level_height = state.settings.level_height, level_width = state.settings.level_width) {
    function gen_tiles_pull(tiles) {
        const pull = []
        const val = tiles.map(tile => tile.tile_type)

        function rand_type(val) {
            return val[Math.floor(Math.random() * val.length)]
        }

        for (let index = 0; index < level_height * level_width / 3; index++) {
            const t = rand_type(val);
            pull.push(t);
            pull.push(t);
            pull.push(t);
        }
        return pull
    }
    const pull = gen_tiles_pull(tiles);
    function shuffle(array) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    }
    shuffle(pull);


    for (let x = 0; x < level_width; x++) {
        for (let y = 0; y < level_height; y++) {
            state.settings.level01.push({ "x": x + 1, "y": y + 1, "tile_type": pull.pop() })

        }
    }
}


function map_init(preset, tiles) {
    function renderBoard() {
        const fr = ' 1fr'
        const col = fr.repeat(state.settings.level_height).slice(1);
        const row = fr.repeat(state.settings.level_width).slice(1)
        board.style.gridTemplateColumns = col;
        board.style.gridTemplateRows = row;
    }
    function renderTile(tile_description, idn, tile) {
        const newDiv = document.createElement("div");
        // const newContent = document.createTextNode(tile_description.symbol);
        // newDiv.appendChild(newContent);
        newDiv.classList.add('tile');
        newDiv.classList.add('f' + tile_description.tile_type)
        newDiv.style.gridColumn = tile.x;
        newDiv.style.gridRow = tile.y;
        newDiv.id = idn;
        board.appendChild(newDiv);
    }

    state.game.lvlmap = preset;
    renderBoard()
    state.game.lvlmap.forEach((tile, index) => {
        tile["idn"] = index;
        const tile_description = tiles.find(description => description.tile_type === tile.tile_type)
        renderTile(tile_description, index, tile)
    })

}


function game_init(settings) {


    function turn(target, selected) {
        if (selected.map(sel => sel.id).includes(target.id)) {
            document.getElementById(target.id).classList.remove('sel')
            state.game.selected = selected.filter(sel => sel.id !== target.id)
            return
        }

        if (!selected[0]) {
            target.classList.add('sel');
            selected.push({ id: target.id, tile_type: target.classList[1] });
            return
        }

        if (selected[0].tile_type !== target.classList[1]) {
            selected.forEach(sel => {
                document.getElementById(sel.id).classList.remove('sel');
            })
            state.game.selected = [];
            target.classList.add('sel');
            state.game.selected.push({ id: target.id, tile_type: target.classList[1] });
            return
        }
        if (selected[0].tile_type === target.classList[1]) {
            target.classList.add('sel');
            selected.push({ id: target.id, tile_type: target.classList[1] });
            return
        }
    }

    function removeSelected(selected) {
        selected.forEach(sel => {
            document.getElementById(sel.id).remove();
            state.game.lvlmap = state.game.lvlmap.filter(t => t.idn !== +sel.id);
        })
        state.game.selected = [];
    }

    function check() {
        const selected = state.game.selected;
        const count = new Set(selected.map(sel => sel.tile_type))
        if (count.size === 1 && selected.length === 3) {
            removeSelected(selected);
        }
    }
    function victory() {
        if (state.game.lvlmap.length === 0) {
            // console.log('win')
            state.game.wins++;
            document.getElementById('score').textContent = state.game.wins;
            restart();
        }
    }
    function handleClick(e) {
        e.preventDefault();
        // console.log('click')
        const target = e.target;
        if (!target.classList.contains('tile')) return
        const selected = state.game.selected
        turn(target, selected);
        check();
        victory();
    }

    board.addEventListener('click', handleClick)
}


init();
game_init(state.settings.tiles);

document.getElementById('btn-reset').addEventListener('click', restart)

function restart() {
    board.querySelectorAll('.tile').forEach(tile => tile.remove());
    state.settings.level01 = [];
    state.game.lvlmap = [];
    state.game.selected = [];
    state.game.tiles_pull = [];
    init();
}
