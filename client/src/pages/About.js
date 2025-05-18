import React from 'react';
import '../css/About.css';


const About = () => (
    <div className="about">
        <div className="about_us_wrapper">
            <div className="cell logo_container">
                <img className="logo" src="/images/logo512.png" alt="Логотип" width="300"/>
                <p className="logo_name">Librarion</p>
            </div>
            <div className="cell text_about_us">
                <p>Автор: Иванов Д.О.,</p>
                <p>студент группы ИКБО-30-22</p>

            </div>
        </div>


        <div className="map_title">
            <p>Наше местоположение на карте</p>
        </div>
        <div className="map_container">
            <iframe className="our_location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2004.6073349677754!2d37.48004894638512!3d55.66993782592479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54dc1d23b51c3%3A0x74763ed59c81ccb6!2z0KDQotCjINCc0JjQoNCt0JA!5e0!3m2!1sru!2sru!4v1695845470817!5m2!1sru!2sru"
                    width="600"
                    height="450"
                    style={{border: 0}}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
    </div>
);

export default About;
