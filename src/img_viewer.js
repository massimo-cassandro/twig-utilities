import {escapeHTML} from '@massimo-cassandro/js-utilities';

// TODO completare come include twig

/*
  import {img_viewer} from '@massimo-cassandro/m-utilities/boilerplate-twig-src/imgs-viewer';

  img_viewer({
    viewer: '/viewer', // default
    img: __img_obj__,
    bbs: [
      {mq: '(min-width: 1199px)', bb:[255,255]},
      {mq: 'lg', bb:[210,210]},
      ...
      {mq: null, bb: [546,480]}
    ],
    lazy: true,
    viewer_params: '', // eventuali parametri aggiunti per il viewer
    img_fmt: ['webp', 'jpeg'], // array dei formati di immagine prodotti dal viewer
    alt: '', // alt
    class: '',
    async: true,
    fw: 'bs4' // bs4 (default) o bs5,
  });


  img è un oggetto nella forma
    {
      id: 20,
      width: 800,
      height: 800,
      mime: "image/jpeg",
      size: 88195,
    }

  bbs è un array di media queries e dimensioni (dal più grande al più piccolo):
  l'ultimo elemento (con mq== null) rappresenta le dimensioni dell'immagine base

  le dimensioni sono un array composto da base e altezza
    [
      {mq: '(min-width: 1199px)', bb:[255,255]},
      {mq: '...', bb:[210,210]},
      ...
      {mq: null, bb: [546,480]}
    ];

  mq può anche essere una delle chiavi di `bs4_std_brkpts` o `bs5_std_brkpts`
  (in base al parametro `fw`)

  l'ultimo deve avere mq = null o 'xs'
*/
export  function img_viewer(params) {

  let bs_std_brkpts = {
    bs4: {
      xs: '(max-width: 575px)',
      sm: '(min-width: 576px) and (max-width: 767px)',
      md: '(min-width: 768px) and (max-width: 991px)',
      lg: '(min-width: 992px) and (max-width: 1199px)',
      xl: '(min-width: 1200px)',

      xs_sm: '(max-width: 767px)',
      xs_md: '(max-width: 991px)',
      md_lg: '(min-width: 768px) and (max-width: 1199px)',
      md_xl: '(min-width: 768px)',
      lg_xl: '(min-width: 992px)'
    }
  };
  bs_std_brkpts.bs5 = {...bs_std_brkpts.bs4,
    xl:  '(min-width: 1200px) and (max-width: 1399px)',
    xxl: '(min-width: 1400px)',

    md_xl:  '(min-width: 768px) and (max-width: 1399px)',
    lg_xl:  '(min-width: 992px) and (max-width: 1399px)',
    md_xxl: '(min-width: 768px)',
    lg_xxl: '(min-width: 992px)',
    xl_xxl: '(min-width: 1200px)'
  };

  let default_params = {
      viewer:        '/viewer',
      img:           null,
      bbs:           [],
      lazy:          true,
      viewer_params: '',          // eventuali parametri aggiunti per il viewer
      alt:           '',          // alt
      class:         '',
      fw:            'bs4',
      async:         true,

      // formati immagine prodotti dal viewer
      // in locale (mamp) non c'è webp (NB: nell'array va prima webp)
      img_fmt: ['8888', '8890'].indexOf(window.location.port) !== -1 ? ['pjpeg'] : ['webp', 'pjpeg'],
    },
    p, // parametri elaborati
    base_src,

    sources = '',
    lazy_data_prefix;

  p = Object.assign({}, default_params, params);
  base_src = `${p.viewer}/${p.img.id}?` + (p.viewer_params ? `${p.viewer_params}&` : '');
  lazy_data_prefix = p.lazy? 'data-' : '';

  // elaborazione bbs e calcolo doppie densità (se l'immagine originale è abbastanza grande)
  p.bbs.forEach( item => {

    let last_item = (item.mq === null || item.mq === 'xs');

    // sostituzione parametro `mq` con il valore di bs_std_brkpts
    // se la chiave corrisponde
    if( p.fw && Object.keys(bs_std_brkpts[p.fw]).indexOf(item.mq) !== -1 ) {
      item.mq = bs_std_brkpts[p.fw][item.mq];
    }

    p.img_fmt.forEach( fmt => {

      let this_bb_wi = item.bb[0]?? '',
        this_bb_he = item.bb[1]?? '',
        this_base_src = base_src + `f=${fmt}&bb=`,
        this_src = '',
        doppia_densita = (!this_bb_wi || +p.img.width >= (this_bb_wi * 2)) &&
          (!this_bb_he || +p.img.heigth >= (this_bb_he * 2));

      this_src = this_base_src + this_bb_wi + 'x' + this_bb_he;

      if(doppia_densita) {
        this_src += ' 1x, ' + this_base_src + (this_bb_wi? this_bb_wi * 2 : '') + 'x' + (this_bb_he? this_bb_he * 2 : '') + ' 2x';
      }

      if(last_item && fmt !== 'webp') {

        sources += `<img ${lazy_data_prefix}src="${this_base_src}${this_bb_wi}x${this_bb_he}"`;
        if(doppia_densita) sources += ` ${lazy_data_prefix}srcset="${this_src}"`;
        if(p.lazy) sources += ' loading="lazy"';
        if(p.class) sources += ` class="${p.class}"`;
        if(p.async) sources += ' decoding ="async"';
        sources += ` alt="${escapeHTML(p.alt)}">`;

      } else {
        sources += `<source ${lazy_data_prefix}srcset="${this_src}"`;
        if(item.mq) sources += ` media="${item.mq}"`;
        if(fmt === 'webp') sources += ' type="image/webp"';
        sources += '>';

      }

    }); // end forEach fmt
  }); // end forEach bbs

  return `<picture>${sources}</picture>`;
}
