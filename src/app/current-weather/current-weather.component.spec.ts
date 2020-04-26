import { ComponentFixture, TestBed, async } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  ObservablePropertyStrategy,
  autoSpyObj,
  injectSpy,
} from 'angular-unit-test-helper'
import { WeatherService, defaultWeather } from '../weather/weather.service'

import { AppMaterialModule } from '../app-material.module'
import { By } from '@angular/platform-browser'
import { CurrentWeatherComponent } from './current-weather.component'
import { ICurrentWeather } from '../interfaces'
import { Store } from '@ngrx/store'
import { fakeWeather } from '../weather/weather.service.fake'
import { of } from 'rxjs'

describe('CurrentWeatherComponent', () => {
  let component: CurrentWeatherComponent
  let fixture: ComponentFixture<CurrentWeatherComponent>
  let weatherServiceMock: jasmine.SpyObj<WeatherService>
  let store: MockStore<{ search: { current: ICurrentWeather } }>
  const initialState = { search: { current: defaultWeather } }

  beforeEach(async(() => {
    const weatherServiceSpy = autoSpyObj(
      WeatherService,
      ['currentWeather$'],
      ObservablePropertyStrategy.BehaviorSubject
    )

    TestBed.configureTestingModule({
      declarations: [CurrentWeatherComponent],
      imports: [AppMaterialModule],
      providers: [
        { provide: WeatherService, useValue: weatherServiceSpy },
        provideMockStore({ initialState }),
      ],
    }).compileComponents()

    weatherServiceMock = injectSpy(WeatherService)
    store = TestBed.inject(Store) as any
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentWeatherComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    // Arrange
    weatherServiceMock.getCurrentWeather.and.returnValue(of())

    // Act
    fixture.detectChanges() // triggers ngOnInit

    // Assert
    expect(component).toBeTruthy()
  })

  it('should get currentWeather from weatherService', () => {
    // Arrange
    store.setState({ search: { current: fakeWeather } })
    weatherServiceMock.currentWeather$.next(fakeWeather)

    // Act
    fixture.detectChanges() // triggers ngOnInit()

    // Assert
    expect(component.current$).toBeDefined()

    component.current$.subscribe((current) => {
      expect(current.city).toEqual('Bethesda')
      expect(current.temperature).toEqual(280.32)

      // Assert on DOM
      const debugEl = fixture.debugElement
      const titleEl: HTMLElement = debugEl.query(By.css('.mat-title')).nativeElement
      expect(titleEl.textContent).toContain('Bethesda')
    })
  })

  xit('should get currentWeather from weatherService', () => {
    // Arrange
    weatherServiceMock.getCurrentWeather.and.returnValue(of())

    // Act
    fixture.detectChanges() // triggers ngOnInit()

    // Assert
    expect(weatherServiceMock.getCurrentWeather).toHaveBeenCalledTimes(1)
  })

  xit('should eagerly load currentWeather in Bethesda from weatherService', () => {
    // Arrange
    weatherServiceMock.getCurrentWeather.and.returnValue(of(fakeWeather))

    // Act
    fixture.detectChanges() // triggers ngOnInit()

    // Assert
    expect(component.current$).toBeDefined()
    component.current$.subscribe((current) => {
      expect(current.city).toEqual('Bethesda')
      expect(current.temperature).toEqual(280.32)
    })

    // Assert on DOM
    const debugEl = fixture.debugElement
    const titleEl: HTMLElement = debugEl.query(By.css('span')).nativeElement
    expect(titleEl.textContent).toContain('Bethesda')
  })
})
