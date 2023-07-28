/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
          // si l'id windowicone contient la class   
			const isIconActivated = windowIcon.classList.contains("active-icon")
			expect(isIconActivated).toBeTruthy()

    })
    // test l'ordre des notes
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // bouton Action icone ouverture de la modale de la note
  describe("When i click on the icone for bill's modal", () => {
    test("Then bill's modal is displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      $.fn.modal = jest.fn()
      const mockBill = new Bills({document, onNavigate, mockStore, localStorage: window.localStorage})

      const iconEye = screen.getAllByTestId("icon-eye")[0]
      const clickIconeImage = jest.fn(mockBill.handleClickIconEye(iconEye))
      iconEye.addEventListener("click", clickIconeImage)
      fireEvent.click(iconEye)
      expect(clickIconeImage).toHaveBeenCalled;
      expect(screen.getAllByText("Justificatif")).toBeTruthy()
    })
  })
  // bouton 'nouvelle note de frais'
  describe("When i click on New Bill", () => {
    test("new bill's page is open", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      };
      const mockBill = new Bills({document, onNavigate, mockStore, localStorage: window.localStorage})
      const clickNewBill = jest.fn((e) => mockBill.handleClickNewBill(e))
      const newBillButton = screen.getByTestId("btn-new-bill")
      
      newBillButton.addEventListener("click", clickNewBill)
      fireEvent.click(newBillButton)

      expect(clickNewBill).toHaveBeenCalled()
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })

  // test d'intégration GET
  describe("When I navigate to bills's interface", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      };
      // mock pour l'interface employé avec l'affichage des notes
      const mockedBills = new Bills({document, onNavigate, store: mockStore, localStorage: window.localStorage,})
      const bills = await mockedBills.getBills()
      document.body.innerHTML = BillsUI({ data: bills })
      expect(bills.length >= 1).toBeTruthy()
    })
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("Fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {list: () => {
            return Promise.reject(new Error("Erreur 404"));
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })

      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})

