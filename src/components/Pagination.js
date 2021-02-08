import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

const LEFT_PAGE = 'LEFT', RIGHT_PAGE = 'RIGHT';

const range = (from, to, step = 1) => {
  let i = from;
  const range = [];
  while (i <= to) {
    range.push(i);
    i += step;
  }
  return range;
};

class Pagination extends Component {
  constructor(props) {
    super(props);
    const { totalRecordsx , pageLimit = 30, pageNeighbours = 0 } = props; //default constructor

    this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 20;
    this.totalRecords = totalRecordsx;

    //pageNeighbours can 0, 1, 2
    this.pageNeighbours = Math.max(0, Math.min(pageNeighbours, 2));
    
    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
    this.state = { currentPage: 1 };
  }
  
  componentDidMount() {
      this.gotoPage(1); //when components mounts, go to firt page
  }

  gotoPage = page => {
    const { onPageChanged = f => f } = this.props; //onPageChanged() func passed as prop
    const currentPage = Math.max(0, Math.min(page, this.totalPages)); //min is page, max is totalPages
    const paginationData = {
      currentPage,
      totalPages: this.totalPages,
      pageLimit: this.pageLimit,
      totalRecords: this.totalRecords
    };
    this.setState({ currentPage }, () => onPageChanged(paginationData));
  }

  handleClick = page => evt => {
    evt.preventDefault(); //prevent default event that event not occur
    this.gotoPage(page);
  }

  handleMoveLeft = evt => {
    evt.preventDefault();
    this.gotoPage(this.state.currentPage - (this.pageNeighbours * 2) - 1);
  }

  handleMoveRight = evt => {
    evt.preventDefault();
    this.gotoPage(this.state.currentPage + (this.pageNeighbours * 2) + 1);
  }

  fetchPageNumbers = () => {
    const totalPages = this.totalPages;
    const currentPage = this.state.currentPage;
    const pageNeighbours = this.pageNeighbours;

    const totalNumbers = (this.pageNeighbours * 2) + 3; //total page shown on control
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours);
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
      let pages = range(startPage, endPage);

      const hasLeftSpill = startPage > 2; //has or not page hide left
      const hasRightSpill = (totalPages - endPage) > 1; //has or not hideed page right
      const spillOffset = totalNumbers - (pages.length + 1); //page of hidden pages either to left or right: 1 or 3

      switch (true) {
        //handle: (1) < {5 6} [7] {8 9} (10) or (1) < {10 11 12 13} [14]
        case (hasLeftSpill && !hasRightSpill): {
            const extraPages = range(startPage - spillOffset, startPage - 1); //(4 4) or (13-3,13-1)
            pages = [LEFT_PAGE, ...extraPages, ...pages]; //LEFT_PAGE = <
            break;
        }

        //handle: (1) {2 3} [4] {5 6} > (10)
        case (!hasLeftSpill && hasRightSpill): {
            const extraPages = range(endPage + 1, endPage + spillOffset); //(7 7)
            pages = [...pages, ...extraPages, RIGHT_PAGE]; //RIGHT_PAGE = >
            break;
        }

        //handle: (1) < {4 5} [6] {7 8} > (10)
        // case (hasLeftSpill && hasRightSpill): 
        default: {
            pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
            break;
        }
        }
        return [1, ...pages, totalPages];
    }
    return range(1, totalPages);
  }
  
  render() {
    if (!this.totalRecords || this.totalPages === 1) return null;

    const { currentPage } = this.state;
    const pages = this.fetchPageNumbers();

    return(
      <Fragment>
        <nav aria-label="Countries Pagination"> {/* aria-label giup giai thich noi dung cua the */}
          <ul className="pagination">
            { pages.map((page, index) => {

              if ( page === LEFT_PAGE ) return (
                <li className="page-item">
                  <a className="page-link" href="#" onClick={this.handleMoveLeft}>
                    <span aria-hidden="true">&laquo;</span>
                    <span className="sr-only">Next</span>
                  </a>
                </li>
              );

              if ( page === RIGHT_PAGE) return (
                <li key={index} className="page-item">
                  <a className="page-link" href="#" aria-label="Next" onClick={this.handleMoveRight}>
                    <span aria-hidden="true">&raquo;</span>
                    <span className="sr-only">Next</span>
                  </a>
                </li>
              );

              return (
                <li key={index} className={`page-item${ currentPage ===page ? 'active' : '' }`}>
                  <a className="page-link" href="#" onClick={ this.handleClick(page) }>{ page }</a>
                </li>
              );
            }) }
          </ul>
        </nav>
      </Fragment>
    )
  }
}

Pagination.propTypes = {
    totalRecords: PropTypes.number.isRequired,
    pageLimit: PropTypes.number, //totalRecords num shown per page
    pageNeighbours: PropTypes.number,
    onPageChanged: PropTypes.func
};

export default Pagination;