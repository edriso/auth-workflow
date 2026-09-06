import { Link } from 'react-router-dom';
import styled from 'styled-components';
import main from '../assets/main.svg';
import { Redirect } from 'react-router-dom';
import { useGlobalContext } from '../context';
function Home() {
  const { user } = useGlobalContext();
  return (
    <>
      {user && <Redirect to='/dashboard' />}
      <Wrapper className='page'>
        <div className='info'>
          <h2>
            <span>Auth</span>
            Workflow
          </h2>
          <p>
            Gummi bears dessert sesame snaps cake lollipop sesame snaps.
            Liquorice croissant pastry biscuit lollipop caramels. Bear claw
            liquorice danish lemon drops powder marshmallow lollipop cake
            marshmallow. Fruitcake danish pie gingerbread sweet. Pudding ice
            cream powder tootsie roll shortbread.
          </p>
          <p>
            Jujubes toffee cheesecake tootsie roll tart cupcake soufflé cupcake.
            Macaroon tootsie roll candy cake cookie cookie marshmallow. Jelly
            gummies chupa chups apple pie jelly-o cookie gummi bears liquorice.
          </p>

          <Link to='/login' className='btn'>
            Login
          </Link>
          <Link to='/register' className='btn'>
            Register
          </Link>
        </div>
        <img src={main} alt='job hunt' className='img main-img' />
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  display: grid;
  align-items: center;
  h2 {
    font-weight: 700;
  }
  h2 span {
    color: var(--primary-500);
  }
  .main-img {
    display: none;
  }
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 6rem;
    .main-img {
      display: block;
    }
  }
  .btn {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }
`;

export default Home;
