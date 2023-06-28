/**
 * @jest-environment jsdom
 */

import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import {screen, waitFor, fireEvent} from "@testing-library/dom"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import BillsUI from "../views/BillsUI.js"

jest.mock("../app/store", () => mockStore)
describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
          // si l'id mailicone contient la class   
			const isIconActivated = mailIcon.classList.contains("active-icon")
			expect(isIconActivated).toBeTruthy()
      })
    })
  describe("When I select a file", () => {
    test("Verify if handleChangeFile have been called", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage,})
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputBtn = screen.getByTestId("file");
      inputBtn.addEventListener("change", handleChangeFile)
      fireEvent.change(inputBtn, {
        target: {
          files: [new File(["test.jpg"], "test.jpg", { type: "image/jpg" })],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputBtn.files[0].name).toBe("test.jpg")
    })
  })
  describe("When I select a bad or a good file's format", () => {
    test("verify if the bad file's format is with an error", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage,})      
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputBtn = screen.getByTestId("file");
      inputBtn.addEventListener("change", (e) => {  
        expect(handleChangeFile(e)).toContain('format error')
       })
      fireEvent.change(inputBtn, {
        target: {
          files: [new File(["test.txt"], "test.txt", { type: "text/txt" })],
        },
      })
      })
  })

})

//Test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new bill", () => {
    test("send bills to mock API POST", async () => {
      Object.defineProperty(window, "localStorage", {value: localStorageMock,});
      window.localStorage.setItem("user", JSON.stringify({type: "Employee",email: "a@a",}));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root);
      router()
      const onNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      })

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage,})

      const buttonSendBill = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)
      buttonSendBill.addEventListener("submit", handleSubmit)
      fireEvent.submit(buttonSendBill);
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")

      window.localStorage.setItem("user", JSON.stringify({type: "Employee", email: "a@a",}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          },
        }
      })

      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})